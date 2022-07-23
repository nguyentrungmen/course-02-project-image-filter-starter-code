import express , {Request, Response} from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import StatusCodes from 'http-status-codes';
(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */
  app.get("/filteredimage", async (request: Request , response: Response) => {

    // Get the image url from query param
    const { image_url } :{image_url:string} = request.query

    // 1. validate the image_url query
    if (!isImgUrl(image_url)) {
      // Bad request response
      response.statusCode = StatusCodes.BAD_REQUEST;
      response.send("The image url invalid!!");
      return;
    }

    // 2. call filterImageFromURL(image_url) to filter the image
    await filterImageFromURL(image_url).then(

      // Read image successfull
      function(image) {
        // 3. send the resulting file in the response
        response.sendFile(image, async (error: Error) => {
          if (error) {
            // Internal server error response
            response.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
            response.send(error.message);
          } else {

            // 4. deletes any files on the server on finish of the response
            await deleteLocalFiles([image]);
            response.statusCode = StatusCodes.OK;
          }
        });
      },
      function(error: Error) { // Read image failed
        // Internal server error response
        response.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        response.send(error.message);
      }
    );
  });

  // check image url
  function isImgUrl(url : any) {
    if(typeof url !== 'string' || !url || url === "") return false;
    return(url.match(/^http[^\?]*.(jpg|jpeg|png|bmp)(\?(.*))?$/gmi) != null);
  }
  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async (request: Request , response: Response) => {
    response.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();