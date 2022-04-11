# StoreFront - A Business Directory System

## General Information

StoreFront is a system allows business owners to add a profile of their business which is searchable by customers, where they may leave reviews and comments on that business. Geoapify Geocoding API was used for validating and acquiring positional information about addresses, and Geoapify Maps API along with Leaflet was used for displaying maps marking the location of validated addresses. MongoDB was used for storing user and business information, and user login / authentication is handled using cookies and JSON Web Tokens.

## GitHub Link

https://github.com/SofianM17/Business-Directory-System

## Instructions For Use

This application requires Node.js (and npm) to be installed in order to run. Additionally, it connects to a MongoDB database, but the application is already set up with all the credentials you will need to do this.

To run this:

- Navigate to the root folder containing "server.js" and "package.json" in your terminal.
- Run the command "npm i" to install the required packages from package.json.
- Run "node server.js" to start the server on localhost:3000
- Navigate to http://localhost:3000/ in your preferred web browser to reach the homepage

## Page Listing

Please note: you do not need to manually navigate to these pages, just use the UI to navigate between them. They are, however, listed here for completeness.

- http://localhost:3000/ and http://localhost:3000/login display the login page, which allows either user type to login
- http://localhost:3000/create-account displays the page which creates a new account for either a business owner or a customer
- http://localhost:3000/business-dashboard/ID displays a user homepage/dashboard with the user's businesses if a business owner is logged in
- http://localhost:3000/add-business displays a business creation form if a business user is logged in
- http://localhost:3000/edit-business/ID displays an edit business profile page for the business with the specified ID if the user owns this business and is logged in
- http://localhost:3000/business-profile-owner/ID displays a business profile with the specified ID if the user owns this business and is logged in
- http://localhost:3000/business-profile-user/ID displays a business profile with the specified ID for the customer if a customer is logged
- http://localhost:3000/customer-dashboard/ID displays a user homepage/dashboard with search functionality if a customer is logged in
- http://localhost:3000/search/SEARCHQUERY displays a page with search results based on the customers search query
- http://localhost:3000/favorites displays the user's favorite businesses if the user is a customer and is logged in

## Notes About Login / Logout

A successful login request (either upon account creation or login) returns the following cookies:

- access_token = the JSON web token used by the server for authentication
- accountType = the account type of the user. Either "business" or "customer", this can be used to direct the user to the correct page
- user = the user id to use when making requests to, say, the business profile owner page. The server will verify that they are the correct user type and user to view the page they want using this id.

These cookies expire in 3 hours, or when the user requests a logout from any page by clicking the logout option.
