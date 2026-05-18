import os
import urllib.request
import time

otp_config_dir = r"c:\Users\user\Desktop\SmartCity\java-otp-backend\otp-config"

otp_jar_path = os.path.join(otp_config_dir, "otp.jar")
brasov_pbf_path = os.path.join(otp_config_dir, "brasov.pbf")

otp_jar_url = "https://repo1.maven.org/maven2/org/opentripplanner/otp/2.4.0/otp-2.4.0-shaded.jar"
brasov_pbf_url = "https://download.geofabrik.de/europe/romania-latest.osm.pbf"
expected_pbf_size = 319029830

def download_file_robust(url, dest_path, expected_size=None):
    print(f"Robust download starting: {url} -> {dest_path}")
    temp_path = dest_path + ".tmp"
    
    max_retries = 10
    retries = 0
    
    while retries < max_retries:
        try:
            headers = {}
            mode = "wb"
            downloaded_bytes = 0
            
            if os.path.exists(temp_path):
                downloaded_bytes = os.path.getsize(temp_path)
                # Check if we are already done
                if expected_size and downloaded_bytes >= expected_size:
                    print("Temp file already matches expected size.")
                    os.replace(temp_path, dest_path)
                    return
                # Ask for remainder of the file
                headers["Range"] = f"bytes={downloaded_bytes}-"
                mode = "ab"
                print(f"Resuming download from byte {downloaded_bytes}...")
            
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as response:
                total_size = expected_size
                if not total_size:
                    content_length = response.headers.get("Content-Length")
                    if content_length:
                        total_size = int(content_length) + downloaded_bytes
                
                print(f"Target size: {total_size / (1024*1024):.1f}MB")
                
                last_reported_percent = -5
                with open(temp_path, mode) as f:
                    while True:
                        chunk = response.read(65536)
                        if not chunk:
                            break
                        f.write(chunk)
                        downloaded_bytes += len(chunk)
                        
                        if total_size:
                            percent = int(downloaded_bytes * 100 / total_size)
                            if percent >= last_reported_percent + 5 or percent == 100:
                                print(f"Progress: {percent}% ({downloaded_bytes / (1024*1024):.1f}MB / {total_size / (1024*1024):.1f}MB)")
                                last_reported_percent = percent
            
            # Successful download completion
            os.replace(temp_path, dest_path)
            print("Download completed successfully!")
            return
            
        except Exception as e:
            retries += 1
            print(f"\nError: {e}. Retry {retries}/{max_retries} in 5 seconds...")
            time.sleep(5)
            
    raise Exception("Failed to download file after maximum retries.")

# 1. Download otp.jar
if not os.path.exists(otp_jar_path) or os.path.getsize(otp_jar_path) < 178000000:
    download_file_robust(otp_jar_url, otp_jar_path)
else:
    print(f"otp.jar already exists at {otp_jar_path}.")

# 2. Download brasov.pbf
if os.path.exists(brasov_pbf_path) and abs(os.path.getsize(brasov_pbf_path) - expected_pbf_size) > 10000:
    print(f"Deleting incorrect brasov.pbf (size: {os.path.getsize(brasov_pbf_path)} bytes)...")
    os.remove(brasov_pbf_path)

if not os.path.exists(brasov_pbf_path):
    download_file_robust(brasov_pbf_url, brasov_pbf_path, expected_pbf_size)
else:
    print(f"brasov.pbf already exists at {brasov_pbf_path}.")

print("Setup complete! All routing binaries are ready.")
