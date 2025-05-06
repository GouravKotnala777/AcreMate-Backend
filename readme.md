# Plot Management System

Manage your real estate sales and payments smoothly (backend part).

[🎉Live Demo](https://acre-mate-frontend.vercel.app)

## 📜 Table Of Content
- About
- Features
- TechStack
- Installation
- Environment Variables
- Usage
- API Documentation

## 📃 About
It is a backend part of real-estate land management service. It manages apis for agents, clients, plots, sites (land area), slips (emis & payments).

## 🔧 Features

- Login/Registration
- List of all plots with due EMI
- Message to clients for due EMIs
- Details of single plot/client/EMI
- List of all sites
- List of all slips
- All agent's sold area data
- Details of single site and it's all plots
- Site CRUD
- Agent CRUD
- Client CRUD
- Slip create/read/cancel
- Plot create/read/update/cancel
- Logout


## 🚀 Tech Stack (backend part)

- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT
- **Others**: Twilio, Bcryptjs, 

## 📦 Installation

```bash
# Clone the repo
git clone https://github.com/your-username/AcreMate-Backend
cd AcreMate-Backend

# server setup
cd server
npm install
# Create a .env file and add environment variables like:
# MONGO_URI, JWT_SECRET, STRIPE_SECRET_KEY, TWILIO_SID, etc.
npm run dev
```
## ⚙️ Environment Variables
```bash
CORS_ORIGINS = your-frontend-url-origin #e.g. http://127.0.0.1:5173
DATABASE_URL = your-database-URI
JWT_SECRET = your-jwt-secret
TWILIO_ACCOUNT_SID = your-twilio-acount-SID
TWILIO_AUTH_TOKEN = your-twilio-auth-token
TWILIO_PHONE = your-twilio-phone-number
```
## API Documentation
server-url : http://localhost:8000/api/v1

#### user related api endpoints
- (GET)  `/user/search`     -> for searching functionality
- (GET)  `/user/all-agents` -> for getting all agents name array
- (GET)  `/user/my-profile` -> for getting loggedin user details
- (GET)  `/user/sold-area`  -> for getting all agents details
- (POST) `/user/register`   -> for use registration
- (POST) `/user/login`      -> for use login
- (POST) `/user/logout`     -> for use logout

#### client related api endpoints
- (POST) `/client/create`       -> for create new client
- (POST) `/client/send-message` -> for sending message to client for due EMIs

#### plot related api endpoints
- (GET)  `/plot/all-plots`    -> for getting all plots
- (GET)  `/plot/pendings`     -> for getting all plots whose client have due EMIs
- (GET)  `/plot/single-plot`  -> for getting all details of a single plot
- (POST) `/plot/create-plots` -> for creating single or multiple new plots at a single time
- (POST) `/plot/assign`       -> for assigning vacant plot to client
- (POST) `/plot/reset`        -> for detaching a occupied plot from client and making it vacant

#### site related api endpoints
- (GET)    `/site/all-sites`   -> for getting all sites
- (GET)    `/site/single-site` -> for getting all details of a single site
- (GET)    `/site/sites-name`  -> for getting array of all siteName
- (POST)   `/site/create`      -> for creating a new site
- (PUT)    `/site/update`     -> for updating an existing site
- (PUT)    `/site/update-row`  -> for updating an existing site's row configurations
- (DELETE) `/site/reset-row`   -> for reseting an existing site's row configurations

#### slip related api endpoints
- (GET)  `/slip/all-slipss` -> for finding all slips in a given range of slipNo
- (POST) `/slip/create`     -> for creating a new slip
- (PUT)  `/slip/update`     -> for updating an existing slip

## 📂 Project Structure
```bash
├── server/
│   ├── dist/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts
│   │   ├── controllers/
│   │   │   ├── clientControllers.ts
│   │   │   ├── plotControllers.ts
│   │   │   ├── siteControllers.ts
│   │   │   ├── slipControllers.ts
│   │   │   ├── userControllers.ts
│   │   │   ├── clientControllers.ts
│   │   ├── middlewares/
│   │   │   ├── auth.ts
│   │   │   ├── errorMiddleware.ts
│   │   ├── models/
│   │   │   ├── clientModel.ts
│   │   │   ├── plotModel.ts
│   │   │   ├── siteModel.ts
│   │   │   ├── slipModel.ts
│   │   │   ├── userModel.ts
│   │   ├── routes/
│   │   │   ├── clientRoutes.ts
│   │   │   ├── plotRoutes.ts
│   │   │   ├── siteRoutes.ts
│   │   │   ├── slipRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   ├── utils/
│   │   │   ├── utilClasses.ts
│   │   │   ├── utilConstants.ts
│   │   │   ├── utilFunction.ts
│   │   │   ├── utilTypes.ts
│   │   ├── app.ts
│   │   ├── index.ts
│   ├── .env
│   ├── package-lock.json
│   ├── package.json
│   ├── readme.md
│   └── tsconfig.json
```
## 🙋‍♂️ Author

Gourav Kotnala
[PortFolio](https://gouravkotnala777.github.io/portfolio-1/)
[GitHub](https://github.com/GouravKotnala777)
[LinkedIn](https://www.linkedin.com/in/gourav-kotnala-003427295)
