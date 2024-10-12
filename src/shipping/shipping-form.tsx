'use client';

import { Form } from '@/forms/form';
import {
  FormItem,
  FormItemErrorMessage,
  FormItemLabel,
} from '@/forms/form-item';
import { Input } from '@/forms/input';
import { PatternFormatInput } from '@/forms/pattern-format-input';
import { Select, SelectItem } from '@/forms/select';
import { SubmitButton } from '@/forms/submit-button';
import type { Continent } from '@/shipping/shipping-types';
import { useRef, useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { completeCheckout } from '../checkout/checkout-actions';
// Import Stripe packages
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { z } from 'zod';

// Load your Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY as string);

// Define the checkout schema
const checkoutSchema = z.object({
  address: z.string().nonempty("Address is required"),
  paymentMethod: z.string().nonempty("Payment method is required"),
});

type CheckoutFormProps = {
  continents: Continent[];
};

function CheckoutFormContent({ continents }: CheckoutFormProps) {
  const formRef = useRef<React.ElementRef<'form'>>(null);
  const [state, formAction] = useFormState(completeCheckout, null);
  const fieldErrors = state?.success ? null : state?.fieldErrors;
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [cityError, setCityError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);

  const [fullName ,setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  const handleValidationName = (value: string) => {
    if (!value) {
      setFullNameError('Full Name is required');
    } else {
      setFullName(value);
      setFullNameError(null);
    }
  };

  const handleValidationCity = (value: string) => {
    if (!value) {
      setCityError('City is required');
    } else {
      setCity(value);
      setCityError(null);
    }
  };


  const handleValidationPhone = (value: string) => {
    if (!value) {
      setPhoneError('Phone Number is required');
    } else {
      setPhone(value);
      setPhoneError(null);
    }
  };
  const handleValidationEmail = (value: string) => {
    if (!value) {
      setEmailError('Email is required');
    } else {
      setEmail(value);
      setEmailError(null);
    }
  };

  const handleValidationAddress = (value: string) => {
    if (!value) {
      setAddressError('Address is required');
    } else {
      setAddress(value);
      setAddressError(null);
    }
  };

  const [continentId, setContinentId] = useState<string>('');
  const [regionId, setRegionId] = useState<string>('');
  const [cityId, setCityId] = useState<string>('');

  const stripe = useStripe(); // Stripe instance
  const elements = useElements(); // Access Stripe elements

  const [paymentStatus, setPaymentStatus] = useState<string | null>(null); // UI feedback

  const continent = continents.find(
    (continent) => continent.id === continentId,
  );
  const regions = continent?.regions;
  const region = regions?.find((region) => region.id === regionId);
  const cities = region?.cities;

  // Handle form submission and payment
  const handleSubmit = async (formData: any) => {
    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setPaymentStatus('Card details not available.');
      return;
    }
    
    // Create a payment intent on your backend first
    const response = await fetch('/api/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: fullName,     
        email: email,
        phone: phone,
        city: city,
        address: address,
      }),
    });

    const { clientSecret } = await response.json();

    // Confirm the payment with the card details
    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          // Add any additional billing details if needed
        },
      },
    });

    if (error) {
      console.error('Payment confirmation error:', error);
      setPaymentStatus('Payment failed. Please try again.');
    } else {
      // Payment successful
      setPaymentStatus('Payment succeeded!');
      try {
        const form = formRef.current;
        const checkoutFormData = new FormData(form!); // Gather form data
  
        // Clear the cart cookie and redirect to the success page
        await completeCheckout(null, checkoutFormData);
      } catch (error) {
        console.error('Error completing checkout:', error);
      }
    }
  };

  // Card Text Light n Dark mode 
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled by checking the `dark` class on the document
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  const cardElementOptions = {
    style: {
      base: {
        color: isDarkMode ? 'white' : 'black',
        '::placeholder': {
          color: isDarkMode ? '#bbbbbb' : '#666666',
        },
        backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
      },
      invalid: {
        color: 'red',
      },
    },
  };

  return (
    <Form
    ref={formRef}
    action={handleSubmit}
  >
    <FormItem isRequired errorMessages={fullNameError ? [fullNameError] : []}>
      <FormItemLabel>Full Name</FormItemLabel>
      <Input name="fullName" placeholder="Full Name"  onChange={(e) => handleValidationName(e.target.value)}/>
      <FormItemErrorMessage />
    </FormItem>

    <FormItem isRequired errorMessages={emailError ? [emailError] : []}>
      <FormItemLabel>E-mail</FormItemLabel>
      <Input name="email" type="email" placeholder="E-mail" onChange={(e) => handleValidationEmail(e.target.value)}/>
      <FormItemErrorMessage />
    </FormItem>

    <FormItem isRequired errorMessages={phoneError ? [phoneError] : []}>
      <FormItemLabel>Phone</FormItemLabel>
      <PatternFormatInput
        name="phone"
        type="tel"
        mask="_"
        format="+1(###) ### ####"
        onChange={(e) => handleValidationPhone(e.target.value)}/>
      <FormItemErrorMessage />
    </FormItem>

    <FormItem isRequired errorMessages={fullNameError ? [fullNameError] : []}>
      <FormItemLabel>City</FormItemLabel>
      <Input name="city" placeholder="City" onChange={(e) => handleValidationCity(e.target.value)}/>
      <FormItemErrorMessage />
    </FormItem>
    
    <FormItem isRequired errorMessages={addressError ? [addressError] : []}>
      <FormItemLabel>Address</FormItemLabel>
      <Input name="address" placeholder="Address" onChange={(e) => handleValidationAddress(e.target.value)} />
      <FormItemErrorMessage />
    </FormItem>

    <FormItem isRequired errorMessages={fieldErrors?.address?._errors}>
      <FormItemLabel>Card</FormItemLabel>
      <div className=' border-2 border-[#E4E4E7] h-10 bg-white rounded-md'>
        <div>
      <CardElement className='pt-2 pl-2 pr-2' options={cardElementOptions}/>
        </div>
      </div>
      <FormItemErrorMessage />
    </FormItem>
    
       {/* Payment status message */}
       {paymentStatus && (
         <div className={`mt-4 ${paymentStatus === 'Payment succeeded!' ? 'text-green-500' : 'text-red-500'}`}>
           {paymentStatus}
         </div>
       )}
    
    <div className="flex justify-end">
      <SubmitButton variant="primary">Complete Checkout</SubmitButton>
    </div>
  </Form>
  );
}

export function ShippingForm({ continents }: CheckoutFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormContent continents={continents} />
    </Elements>
  );
}
