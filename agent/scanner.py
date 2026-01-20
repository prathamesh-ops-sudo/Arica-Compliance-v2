import platform
import subprocess
import json
import os
import psutil
try:
    import wmi
    import winreg
except ImportError:
    # Adding placeholders for dev environment if not on Windows or missing libs
    # But this is intended for Windows EXE.
    pass

class SystemScanner:
    def __init__(self):
        self.scan_results = {}
        try:
            self.wmi_client = wmi.WMI()
        except:
            self.wmi_client = None

    def scan(self):
        self.scan_results = {
            "os_info": self.get_os_info(),
            "antivirus": self.check_antivirus(),
            "firewall": self.check_firewall(),
            "disk_encryption": self.check_disk_encryption(),
            "screen_lock": self.check_screen_lock(),
            "users": self.get_users(),
        }
        return self.scan_results

    def get_os_info(self):
        return {
            "system": platform.system(),
            "release": platform.release(),
            "version": platform.version(),
            "hostname": platform.node()
        }

    def check_antivirus(self):
        if not self.wmi_client:
            return {"status": "unknown", "details": "WMI not available"}
        
        try:
            # SecurityCenter2 isn't always accessible without admin, handling gracefully
            wmi_security = wmi.WMI(namespace="root/SecurityCenter2")
            av_products = wmi_security.query("SELECT * FROM AntivirusProduct")
            if av_products:
                return {
                    "status": "active", 
                    "products": [p.displayName for p in av_products],
                    "count": len(av_products)
                }
            return {"status": "inactive", "details": "No Antivirus found in SecurityCenter2"}
        except Exception as e:
            return {"status": "error", "details": str(e)}

    def check_firewall(self):
        # Using netsh to check firewall status (requires admin mostly, but can read config)
        try:
            output = subprocess.check_output("netsh advfirewall show allprofiles state", shell=True).decode()
            if "ON" in output:
                return {"status": "active", "details": "Firewall is ON for at least one profile"}
            return {"status": "inactive", "details": "Firewall seems OFF"}
        except Exception as e:
            return {"status": "error", "details": str(e)}

    def check_disk_encryption(self):
        # Checking BitLocker status via PowerShell
        try:
            cmd = "manage-bde -status"
            output = subprocess.check_output(cmd, shell=True).decode()
            if "Protection On" in output:
                return {"status": "active", "details": "BitLocker Protection Found"}
            return {"status": "inactive", "details": "BitLocker Protection NOT found or Drive not encrypted"}
        except Exception as e:
            return {"status": "attention", "details": "Could not verify (might valid if not Pro edition). Error: " + str(e)}

    def check_screen_lock(self):
        # Check ScreenSaveActive and ScreenSaveTimeOut in Registry
        try:
            key_path = r"Control Panel\Desktop"
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, key_path) as key:
                active, _ = winreg.QueryValueEx(key, "ScreenSaveActive")
                timeout, _ = winreg.QueryValueEx(key, "ScreenSaveTimeOut")
                return {
                    "status": "active" if active == "1" else "inactive",
                    "timeout_seconds": timeout,
                    "details": f"Screen saver active: {active}, Timeout: {timeout}s"
                }
        except Exception as e:
             return {"status": "unknown", "details": "Registry check failed: " + str(e)}

    def get_users(self):
        return [user.name for user in psutil.users()]

if __name__ == "__main__":
    scanner = SystemScanner()
    print(json.dumps(scanner.scan(), indent=2))
