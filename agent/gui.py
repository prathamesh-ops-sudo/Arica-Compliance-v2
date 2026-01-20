import sys
import customtkinter as ctk
import threading
import json
import os
from scanner import SystemScanner
from uploader import Uploader

ctk.set_appearance_mode("System")  # Modes: "System" (standard), "Dark", "Light"
ctk.set_default_color_theme("blue")  # Themes: "blue" (standard), "green", "dark-blue"

class App(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("Arica Compliance Agent")
        self.geometry("800x600")

        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        self.sidebar_frame = ctk.CTkFrame(self, width=200, corner_radius=0)
        self.sidebar_frame.grid(row=0, column=0, rowspan=4, sticky="nsew")
        self.sidebar_frame.grid_rowconfigure(4, weight=1)

        self.logo_label = ctk.CTkLabel(self.sidebar_frame, text="Arica Agent", font=ctk.CTkFont(size=20, weight="bold"))
        self.logo_label.grid(row=0, column=0, padx=20, pady=(20, 10))

        self.sidebar_button_1 = ctk.CTkButton(self.sidebar_frame, text="Scan System", command=self.sidebar_button_event)
        self.sidebar_button_1.grid(row=1, column=0, padx=20, pady=10)
        
        self.user_type_var = ctk.StringVar(value="employee")
        self.radio_button_1 = ctk.CTkRadioButton(self.sidebar_frame, text="Employee", variable=self.user_type_var, value="employee", command=self.change_user_type)
        self.radio_button_1.grid(row=2, column=0, pady=10, padx=20, sticky="n")
        
        self.radio_button_2 = ctk.CTkRadioButton(self.sidebar_frame, text="Admin", variable=self.user_type_var, value="admin", command=self.change_user_type)
        self.radio_button_2.grid(row=3, column=0, pady=10, padx=20, sticky="n")

        self.status_label = ctk.CTkLabel(self.sidebar_frame, text="Status: Ready", wraplength=180)
        self.status_label.grid(row=5, column=0, padx=20, pady=20)

        # Main Content
        self.main_frame = ctk.CTkScrollableFrame(self, label_text="Dashboard")
        self.main_frame.grid(row=0, column=1, padx=20, pady=20, sticky="nsew")

        self.logs = ctk.CTkTextbox(self.main_frame, height=200)
        self.logs.pack(fill="x", padx=10, pady=10)
        self.log_message("Welcome to Arica Compliance Agent.")

        # Admin Questionnaire Frame
        self.questionnaire_frame = ctk.CTkFrame(self.main_frame)
        # Initiated hidden

        self.questions = []
        self.load_questions()
        self.question_vars = {}

    def log_message(self, msg):
        self.logs.insert("end", msg + "\n")
        self.logs.see("end")

    def resource_path(self, relative_path):
        """ Get absolute path to resource, works for dev and for PyInstaller """
        try:
            # PyInstaller creates a temp folder and stores path in _MEIPASS
            base_path = sys._MEIPASS
        except Exception:
            base_path = os.path.abspath(".")

        return os.path.join(base_path, relative_path)

    def load_questions(self):
        try:
            path = self.resource_path("questions.json")
            with open(path, "r") as f:
                self.questions = json.load(f)
        except Exception as e:
            self.log_message(f"Error loading questions: {e}\nPath: {self.resource_path('questions.json')}")

    def change_user_type(self):
        user_type = self.user_type_var.get()
        self.log_message(f"Switched to {user_type} mode.")
        if user_type == "admin":
            self.show_questionnaire()
        else:
            self.hide_questionnaire()

    def show_questionnaire(self):
        self.questionnaire_frame.pack(fill="both", expand=True, padx=10, pady=10)
        # Clear existing
        for widget in self.questionnaire_frame.winfo_children():
            widget.destroy()
        
        ctk.CTkLabel(self.questionnaire_frame, text="Admin Questionnaire", font=ctk.CTkFont(size=16, weight="bold")).pack(pady=10)

        for q in self.questions:
            q_frame = ctk.CTkFrame(self.questionnaire_frame)
            q_frame.pack(fill="x", pady=5, padx=5)
            
            ctk.CTkLabel(q_frame, text=q["text"], wraplength=500, justify="left").pack(anchor="w", padx=5)
            
            var = ctk.StringVar(value="")
            self.question_vars[q["id"]] = var
            
            opts_frame = ctk.CTkFrame(q_frame)
            opts_frame.pack(anchor="w", padx=10)
            
            for opt in q["options"]:
                ctk.CTkRadioButton(opts_frame, text=opt, variable=var, value=opt).pack(side="left", padx=5)

    def hide_questionnaire(self):
        self.questionnaire_frame.pack_forget()

    def sidebar_button_event(self):
        self.sidebar_button_1.configure(state="disabled")
        self.log_message("Starting scan...")
        threading.Thread(target=self.run_process).start()

    def run_process(self):
        try:
            scanner = SystemScanner()
            scan_results = scanner.scan()
            self.log_message("Scan completed.")
            
            report = {
                "hostname": scan_results["os_info"]["hostname"],
                "userType": self.user_type_var.get(),
                "scanData": scan_results,
                "status": "pending"
            }

            if self.user_type_var.get() == "admin":
                q_data = {}
                for qid, var in self.question_vars.items():
                    q_data[qid] = var.get()
                report["questionnaireData"] = q_data
                self.log_message("Questionnaire data collected.")

            self.log_message("Uploading report...")
            uploader = Uploader() # Default localhost:5000
            result = uploader.upload_report(report)
            
            if result["success"]:
                self.log_message("Upload Successful!")
                self.status_label.configure(text="Status: Uploaded", text_color="green")
            else:
                self.log_message(f"Upload Failed: {result['error']}")
                self.status_label.configure(text="Status: Failed", text_color="red")
                
        except Exception as e:
            self.log_message(f"Error: {e}")
            self.status_label.configure(text="Status: Error", text_color="red")
        finally:
            self.sidebar_button_1.configure(state="normal")

if __name__ == "__main__":
    app = App()
    app.mainloop()
