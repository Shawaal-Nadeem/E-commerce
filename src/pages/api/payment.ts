import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { parse } from 'cookie';  
import { createClient } from 'contentful';
import { Client } from 'pg';

async function getNestedRichData(client: any, section: any) {
    if (section && section.fields?.productsData) {
      const productsData = await Promise.all(
        section.fields.productsData.map(async (item: any) => {
          const entry = await client.getEntry(item.sys.id);
          return entry;
        })
      );
      return productsData;
    }
  }

async function getCartData(req: NextApiRequest){

    const cookies = parse(req.headers.cookie || '');
    const cart = JSON.parse(cookies.cart || '[]');
    // console.log('Cart:', JSON.stringify(cart, null, 2));

    const spaceId = process.env.NEXT_PUBLIC_SPACE_ID;
    const accessToken = process.env.NEXT_PUBLIC_CONTENT_DELIVERY_API;

    const client = createClient({
        space: spaceId as string,
        accessToken: accessToken as string,
    });

    let newData = null;

    try {
        // Fetch the categories from Contentful
        const ecommData = await client.getEntries({
            content_type: 'categories',
        });
        newData = ecommData.items; 
    } catch (err) {
        console.error('Error fetching data:', err);
    }

    const categories = newData?.map((item) => item.fields.category).flat();
  const fetchedProducts:any = [];
  let customerProductsData:any = [];
  let overallTotalPrice = 0;

  // console.log('Categories:', categories);

  // Loop through each cart item and find corresponding product data by slug (productId)
  for (const cartItem of cart) {
    const slugVal = cartItem.productId;
    // console.log('Slug Value in Cart:', slugVal);

    let foundProduct = null;
    let foundCategory = null;

    // Iterate over each category and search for the product
    if (Array.isArray(categories)) {
      for (const category of categories) {
        const categoryProducts = await getNestedRichData(client, category);

        if (categoryProducts && categoryProducts.length > 0) {
          // Search for the product within this category
          const product = categoryProducts.find(
            (product: any) =>
              product.fields.slug.toLowerCase() === slugVal.toLowerCase()
          );

          if (product) {
            foundProduct = product;
            foundCategory = category;
            break; // Stop the loop once the product is found
          }
        }
      }
    }

    if (foundProduct) {
      // Store product data along with the count from the cart
      fetchedProducts.push({
        product: foundProduct,
        count: cartItem.count,
      });

      const itemTotalPrice = foundProduct.fields.price * cartItem.count;


      customerProductsData.push({
        name: foundProduct.fields.name,
        price: foundProduct.fields.price,
        quantity: cartItem.count,
        totalPrice: itemTotalPrice,
      });
      overallTotalPrice += itemTotalPrice;

    }
  }

  // Log the fetched products
  // console.log('Customer Products Data :', JSON.stringify(customerProductsData));
  // console.log('Overall Total Price:', overallTotalPrice);
  return {customerProductsData, overallTotalPrice};
}

// Create a new PostgreSQL client
const client = new Client({
  connectionString: process.env.DATABASE_URL, // Neon connection string stored in .env
  ssl: {
    rejectUnauthorized: false, // Required for Neon PostgreSQL
  },
});

client.connect();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    // Initialize Stripe with your secret key (put this in your .env.local)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-09-30.acacia',
  });

    if (req.method === 'POST') {
        try {
            
        const {customerProductsData, overallTotalPrice} = await getCartData(req);

        // console.log('Request Body:', req.body);
      const { fullName, email, phone, city, address} = req.body;

      // Start a transaction
      await client.query('BEGIN');

      // Insert customer details and total price into the customer_orders table
      const insertOrderQuery = `
        INSERT INTO customer_orders (full_name, email, phone, city, address, overall_total_price)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      const orderValues = [fullName, email, phone, city, address, overallTotalPrice];
      const orderResult = await client.query(insertOrderQuery, orderValues);
      const orderId = orderResult.rows[0].id;

      // Insert product details into the order_products table for each product
      const insertProductQuery = `
        INSERT INTO order_products (order_id, product_name, product_price, quantity, total_price)
        VALUES ($1, $2, $3, $4, $5)
      `;

      for (const product of customerProductsData) {
        const productValues = [
          orderId,
          product.name,
          product.price,
          product.quantity,
          product.totalPrice,
        ];
        await client.query(insertProductQuery, productValues);
      }

      // Commit the transaction
      await client.query('COMMIT');
        
      const paymentIntent = await stripe.paymentIntents.create({
        // Stripe consider amount in smaller units like cents so that's why when we give amount so multiple by 100 it gives actual amount
        amount: overallTotalPrice*100, 
        currency: 'usd', 
        payment_method_types: ['card'],
      });

      // console.log('Payment Intent Created:', paymentIntent);

      // Return the client secret to complete the payment
      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error(error);
      await client.query('ROLLBACK');
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
