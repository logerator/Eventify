# Local MariaDB Setup for Eventify

Follow these steps to run Eventify with MariaDB on your own computer.

## Step 1: Install MariaDB
Download and install MariaDB on your device.

During installation:
- remember your root password
- keep the default port as `3306`

After installation, open MariaDB from your terminal or command line.

For Windows PowerShell, this may look like:

```powershell
& "C:\Program Files\MariaDB 12.2\bin\mysql.exe" -u root -p

Then enter your MariaDB password.


## Step 2: Create the Eventify database and users table
Once you are inside MariaDB, run the following SQL:

CREATE DATABASE eventify;
USE eventify;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

To verify it worked, run:

SHOW DATABASES;
USE eventify;
SHOW TABLES;


## Step 3: Create a .env file in the backend folder

Inside the backend folder, create a file named: .env

Add the following:

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MARIADB_PASSWORD
DB_NAME=eventify
JWT_SECRET=change_this_to_something_random

---> Replace YOUR_MARIADB_PASSWORD with your actual MariaDB root password.


## Step 4: Install backend dependencies and start the backend
Open a terminal in the backend folder and run:

npm install
npm run dev

If everything is working, you should see:

Server running on port 5000

You can test that the backend is running by going to:

http://localhost:5000

You should see:

Backend is working

You can also test the database connection by going to:

http://localhost:5000/test-db

If the database is connected and empty, you should see:

[]


## Step 5: Start the frontend
Open another terminal in the main project folder and run:

npm install
npm start

Then open:

http://localhost:3000

From there, go to the login/signup page and create an account.

If signup works, the user should be added to the MariaDB users table. You can confirm by checking:

http://localhost:5000/test-db