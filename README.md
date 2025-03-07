# Qadem

Qadem is a platform designed to streamline the university admissions process for private universities in Egypt. This project includes both backend and frontend components to manage user authentication, profiles, and other features required for the admissions process.

## Project Structure

The project consists of two main directories:
- **backend**: Contains the backend code, including APIs, database models, and configurations.
- **frontend**: Contains the frontend code, built with React, for the user interface.

---

## Requirements

### Prerequisites
- **Backend**:
  - Python 3.x
  - Virtual Environment (`venv`)
  - Flask and required dependencies (listed in `requirements.txt`)
- **Frontend**:
  - Node.js and npm

---

## Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Qadem
```

---

## Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Set up a virtual environment**:
   ```bash
   python3 -m venv myenv
   source myenv/bin/activate  # On Windows, use myenv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Database Setup** (if needed):
   - Make sure `db.sqlite3` is set up in the backend directory.
   - If running for the first time, ensure that your models are created and configured in `db.py` or within the `Models` directory.
   - Run initial migrations if necessary.

5. **Run the backend server**:
   ```bash
   python run.py
   ```

---

## Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the frontend server**:
   ```bash
   npm start
   ```

---

## Usage

After running both the backend and frontend, you can access the Qadem application at `http://localhost:3000`. The frontend interacts with the backend API, allowing users to register, log in, complete their profile, and manage their applications.

---

## Environment Variables

Make sure to configure any required environment variables, such as database URLs, secret keys, or API keys, in the `config.py` file in the backend and in `.env` for the frontend (if needed).