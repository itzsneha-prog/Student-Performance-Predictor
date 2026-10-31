//1.Get html elements
const form = document.getElementById("predictionForm");
const predictButton=document.getElementById("predictButton");
const errorMessage=document.getElementById("errorMessage");
const resultCard=document.getElementById("resultCard");
const predictionValue=document.getElementById("predictionValue");


//2.FastAPI backend URL
const API_URL="https://student-performance-api-92wn.onrender.com/predict";

//3.Function to get numerical values
function getNumber(id){
    const value=Number(document.getElementById(id).value);

    if(!Number.isFinite(value)){
        throw new Error(`Please enter a valid value for ${id}`);
    }

    return value;
}

function addOneHot(target,prefix,selectedValue,options){
    options.forEach(option =>{
        target[`${prefix}_${option}`]=
        selectedValue===option?1:0;
    });
}

form.addEventListener("submit",async function(event){

    event.preventDefault();

    errorMessage.textContent="";
    resultCard.style.display="none";

    predictButton.disabled=true;
    predictButton.textContent="predicting...";


    try{

        //Collect numerical and binary features

        const studentData={
            school:getNumber("school"),
            sex:getNumber("sex"),
            age:getNumber("age"),
            address:getNumber("address"),
            famsize:getNumber("famsize"),
            Pstatus:getNumber("Pstatus"),
            Medu:getNumber("Medu"),
            Fedu:getNumber("Fedu"),
            traveltime:getNumber("traveltime"),
            studytime:getNumber("studytime"),
            failures:getNumber("failures"),
            schoolsup:getNumber("schoolsup"),
            famsup:getNumber("famsup"),
            paid:getNumber("paid"),
            activities:getNumber("activities"),
            nursery:getNumber("nursery"),
            higher:getNumber("higher"),
            internet:getNumber("internet"),
            romantic:getNumber("romantic"),
            famrel:getNumber("famrel"),
            freetime:getNumber("freetime"),
            goout:getNumber("goout"),
            Dalc:getNumber("Dalc"),
            Walc:getNumber("Walc"),
            health:getNumber("health"),
            absences:getNumber("absences"),
            G1:getNumber("G1"),
            G2:getNumber("G2")
        };

        //collect categorical values
        const Mjob=document.getElementById("Mjob").value;
        const Fjob=document.getElementById("Fjob").value;
        const reason =document.getElementById("reason").value;
        const guardian=document.getElementById("guardian").value;

        //One-hot encode Mjob

        addOneHot(
            studentData,
            "Mjob",
            Mjob,
            ["at_home","health","other","services","teacher"]
        );

        //One-hot encode Fjob

        addOneHot(
            studentData,
            "Fjob",
            Fjob,
            ["at_home","health","other","services","teacher"]
        );

        //One-hot encode reason
        addOneHot(
            studentData,
            "reason",
            reason,
            ["course","home","other","reputation"]
        );

        //One-hot encode guardian
        addOneHot(
            studentData,
            "guardian",
            guardian,
            ["father","mother","other"]
        );

        //6.Send data to FastAPIs 
        const response=await fetch(API_URL,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                features:studentData
            })
        });

        //7.Receive response from backend
        const result =await response.json();

        if(!response.ok){
            throw new Error(result.detail || "Prediction failed");
        }

        //8.Display prediction
        predictionValue.textContent=
            Number(result.prediction).toFixed(2);

        resultCard.style.display="block";
    }

    catch(error){
        console.error("Prediction error:",error);
        errorMessage.textContent=error.message || "Something went wrong";
    }

    finally {
        predictButton.disabled=false;
        predictButton.textContent="Predict Performance";
    }
});
