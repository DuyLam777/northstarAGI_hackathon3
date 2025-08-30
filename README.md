# northstarAGI_hackathon3


Start server:
```
source .venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000 &
```

If some process is using 8000 you can turn it off with this command (arch linux):
```
sudo fuser -k 8000/tcp
```

Test bloodwork upload (replace the example url with the url of the image on your system):
```
curl -X POST -F "file=@/path/to/your/image.png" http://0.0.0.0:8000/uploadfile/
```