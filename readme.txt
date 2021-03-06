-install mongo db locally to your system or configure mlab 
--see sample_req_res.txt to see sample request and response
-I would recommend to use postman to test your API's
-unzip the file go to root directory and open terminal and write the following command-
----- npm install ----
------node index.js-----


////////Directory structure//////

	 --config/
	         -database.js                    //for connection information
	       
	 --middleware/
	             -auth.js                    //authentication middleware
	   
	 --model/
		 -emp.js                         //model for employee(super user) schema
		 -user.js                        //model for user schema
	   
	 --node_modules
	 
	 --routes/
	         -emp.js                         //API endpoints for employee
	         -user.js                        //API endpoints for User
	         
	 --index.js                              //express server
	 
	 --package-lock.json
	 
	 --package.json
	 
	 --readme.txt
	 
	 --sample_req_res.txt
	    

		 
