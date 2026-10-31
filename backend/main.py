#1.Import required libraries 
from fastapi import FastAPI,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import  pandas as pd
import joblib
from pathlib import Path

#2.Create FastAPI application
app=FastAPI(
    title="Student Performance Prediction API",
    description="Predict student final grades using Machine Learning",
    version="1.0"
)

#3.Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

#4.Load the trained Random Forest model
BASE_DIR=Path(__file__).resolve().parent

MODEL_PATH=BASE_DIR /"student_performance_model.pkl"
model=joblib.load(MODEL_PATH)

#5.Define the expected features names
FEATURES_NAME=[
    'school', 'sex', 'age', 'address', 'famsize', 'Pstatus',
    'Medu', 'Fedu', 'traveltime', 'studytime', 'failures',
    'schoolsup', 'famsup', 'paid', 'activities', 'nursery',
    'higher', 'internet', 'romantic', 'famrel', 'freetime',
    'goout', 'Dalc', 'Walc', 'health', 'absences', 'G1', 'G2',
    'Mjob_at_home', 'Mjob_health', 'Mjob_other',
    'Mjob_services', 'Mjob_teacher',
    'Fjob_at_home', 'Fjob_health', 'Fjob_other',
    'Fjob_services', 'Fjob_teacher',
    'reason_course', 'reason_home', 'reason_other',
    'reason_reputation',
    'guardian_father', 'guardian_mother', 'guardian_other'
]

#6.Define the incoming request structure
class StudentData(BaseModel):
    features:dict[str,float]

#7.Create the home endpoint

@app.get("/")
def home():
    return{
        "message":"Welcome to Student Performance Prediction API!"
    }

#8.Create the prediction endpoint
@app.post("/predict")
def predict(data: StudentData):
    try:
        #Check for missing features
        missing_features=[
            feature for feature in FEATURES_NAME
            if feature not in data.features
        ]

        if missing_features:

            raise HTTPException(
                status_code=400,
                detail=f"Missing features:{missing_features}"
            )

        #Arrange feature in the correct order
        input_df=pd.DataFrame(
            [data.features],
            columns=FEATURES_NAME
        )

        #Generate prediction
        prediction=model.predict(input_df)

        #Return prediction as JSON
        return {
            "prediction":float(prediction[0])
        }
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )