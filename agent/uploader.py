import requests
import json

class Uploader:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url

    def upload_report(self, report_data):
        """
        Uploads the report to the server.
        report_data should match the schema:
        {
            "hostname": "...",
            "userType": "admin" | "employee",
            "scanData": "{...}", (JSON string)
            "questionnaireData": "{...}" (JSON string or null),
            "status": "pending"
        }
        """
        url = f"{self.base_url}/api/agent"
        try:
            # report_data fields might be dicts, but server expects stringified JSON for scanData/questionnaireData 
            # based on schema. However, if I send JSON, Express parser might handle it?
            # Schema said: scanData: text("scan_data")
            # So I should ensure they are strings.
            
            payload = report_data.copy()
            if isinstance(payload.get('scanData'), dict):
                payload['scanData'] = json.dumps(payload['scanData'])
            if isinstance(payload.get('questionnaireData'), dict):
                payload['questionnaireData'] = json.dumps(payload['questionnaireData'])

            response = requests.post(url, json=payload)
            response.raise_for_status()
            return {"success": True, "data": response.json()}
        except Exception as e:
            return {"success": False, "error": str(e)}
