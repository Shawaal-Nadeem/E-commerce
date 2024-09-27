import { documentToReactComponents } from "@contentful/rich-text-react-renderer"
import { BLOCKS } from "@contentful/rich-text-types";

export default function ProductRichDescription({richDescriptions}:any){
    const options = {
        renderNode: {
          
          [BLOCKS.PARAGRAPH]: (node:any) => (
            <p className=" text-sm">{node.content[0].value}</p>
          ),
        },
      }; 
    return(
    <>
            {documentToReactComponents(richDescriptions, options)}
    </>
    )
}