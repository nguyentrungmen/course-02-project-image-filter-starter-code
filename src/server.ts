import express from 'express';
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
  app.get("/filteredimage", async (req, res) => {

    // Get the image url from query param
    const imageUrl = req.query.image_url;

    // 1. validate the image_url query
    if (!isImgUrl(imageUrl)) {
      // Bad request response
      res.statusCode = StatusCodes.BAD_REQUEST;
      res.send("The image url invalid!!");
      return;
    }

    // 2. call filterImageFromURL(image_url) to filter the image
    await filterImageFromURL(imageUrl).then(

      // Read image successfull
      function(image) {
        // 3. send the resulting file in the response
        res.sendFile(image, async (error) => {
          if (error) {
            // Internal server error response
            res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
            res.send(error.message);
          } else {

            // 4. deletes any files on the server on finish of the response
            await deleteLocalFiles([image]);
            res.statusCode = StatusCodes.OK;
          }
        });
      },
      function(error) { // Read image failed
        // Internal server error response
        res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        res.send(error.message);
      }
    );
  });

  function isImgUrl(url : any) {
    if(typeof url !== 'string' || !url || url === "") return false;
    return(url.match(/^http[^\?]*.(jpg|jpeg|png|bmp|tiff|gif)(\?(.*))?$/gmi) != null);
  }
  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();