# 1. Start with an official Python base image
FROM python:3.13-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Install the ZBar system library (the key step!)
RUN apt-get update && apt-get install -y libzbar0

# 4. Copy your requirements file and install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of your application code into the container
COPY . .

# 6. Expose the port your app runs on
EXPOSE 8000

# 7. Define the command to run your app
#    --host 0.0.0.0 is crucial to make it accessible outside the container
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]