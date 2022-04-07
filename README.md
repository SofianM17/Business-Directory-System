# Business Directory System

This system allows business owners to add a profile of their business which is searchable by customers, where they may leave reviews and comments on that business. ArcGIS API is used for geospatial visualization of business locations.

- http://localhost:3000/add-business displays a business creation form if a business user is logged in
- http://localhost:3000/business-profile-owner/ID displays a business profile for the business with the specified ID
- http://localhost:3000/edit-business/ID displays an edit business profile page for the business with the specified ID
- http://localhost:3000/create-account displays the page which creates a new account for either a business owner or a customer
- http://localhost:3000/login displays the page which allows either user type to login
- http://localhost:3000/customer-dashboard/ID displays a user homepage/dashboard if a customer is logged in
- http://localhost:3000/search/SEARCHQUERY displays a page with search results based on the customers search query
- http://localhost:3000/business-profile-user/ID displays a business profile for the customer with the specified ID

## Notes about login:

A successful login request (either upon account creation or login) returns the following cookies:

- access_token = the JSON web token used by the server for authentication
- accountType = the account type of the user. Either "business" or "customer", this can be used to direct the user to the correct page
- user = the user id to use when making requests to, say, the business profile owner page. The server will verify that they are the correct user type and user to view the page they want using this id.
