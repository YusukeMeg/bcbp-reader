
const jsQR = require("jsqr");
const ZXing = require("@zxing/library")
(async ()=>{
    debug_point = document.getElementById("debug");

    const reader = new ZXing.BrowserQRCodeReader();
    // debug_point.innerText = "debuglog";
    // image_point = document.getElementById("ticket");
    // await new Promise((resolve,reject)=>{
    //     image_point.addEventListener("load",(event)=>{
    //         resolve();
    //     });
    // })
    
    canvas = document.getElementById("canvas");

    ctx = document.getElementById("canvas").getContext("2d");
    // ctx.drawImage(image_point,0,0);
    // const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var myReq;
    codetext = await new Promise(resolve=>{
        function tick() {
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
              ctx.height = video.videoHeight;
              ctx.width = video.videoWidth;
              ctx.drawImage(video, 0, 0, ctx.width, ctx.height);
              var imageData = ctx.getImageData(0, 0, ctx.width, ctx.height);
              var code = jsQR(imageData.data, imageData.width, imageData.height, {
                  inversionAttempts: "dontInvert",
              });
              if(code){
                  code = reader.decodeFromVideoDevice(undefined,video);
              }
              console.log(code)              
              if(code && /^M1/.test(code.data)){
                  resolve(code.data)
              }
              
          }
          myReq=requestAnimationFrame(tick);
        }

        video = document.createElement("video");
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
            video.srcObject = stream;
            video.setAttribute("playsinline", true);
            video.play();
            myReq=requestAnimationFrame(tick);
        }).catch(error=>{
            console.log(error)
            debug_point.innerText = error;
        });
    })
    // canvas.style = "display:none;"
    cancelAnimationFrame(myReq);
   


   
    // codetext = ""
    // const code = jsQR(imageData.data, imageData.width, imageData.height);

    // debug_point.innerText = codetext;
    codetext = codetext || code.data
    bcbp_structure = [
    {key:"Format_Code", len:1},
    {key:"Number_of_Legs_Encoded", len:1},
    {key:"Passenger_Name", len:20 },
    {key:"Electronic_Ticket_Indicator", len:1},
    {key:"Operating_carrier_PNR_Code", len:7},
    {key:"From_City_Airport_Code", len:3},
    {key:"To_City_Airport_Code", len:3},
    {key:"Operating_carrier_Designator",len:3},
    {key:"Flight_Number", len:5},
    {key:"Date_of_Flight",len:3 ,callback:(e)=>{d=(new Date());d.setDate(1);d.setMonth(0);d.setDate(e);return(d.toDateString())}},
    {key:"Compartment_Code",len:1},
    {key:"Seat_Number",len:4},
    {key:"Checkin_Sequence_Number",len:5},
    {key:"Passenger_Status",len:1},
    {key:"Field_Size_of_variable_size_field",fialdlen1:2, len:2},
    {key:"Beginning_of_version_number", len:1},
    {key:"Version_Number", len:1},
    {key:"Conditional_items",array:[
        {key:"Field_Size_of_follow_ing_structured_message",fialdlen2:2, len:2},
        {key:"Passenger_Description", len:1},
        {key:"Source_of_checkin", len:1},
        {key:"Source_of_Boarding_Pass_Issuance", len:1},
        {key:"Date_of_Issue_of_Boarding_Pass", len:4},
        {key:"Document_Type", len:1},
        {key:"Airline_Designator_of_boarding_pass_issuer", len:3},
        {key:"Baggage_Tag_Licence_Plate_Number", len:13},
        {key:"1st_NonConsecutive_Baggage_Tag_Licensce_Plate_Number", len:13},
        {key:"2nd_NonConsecutive_Baggage_Tag_Licensce_Plate_Number", len:13},
        {key:"Addtional_items", array:[
            {key:"Field_Size_of_follow_ing_structured_message__repeated",fialdlen3:2, len:2},
            {key:"Airline_Numeric_Code", len:3},
            {key:"Document_Form", len:10},
            {key:"Selectee_indicator", len:1},
            {key:"International_Documentation_Verification", len:1},
            {key:"Marketing_carrier_designator", len:3},
            {key:"Frequent_Flyer_Airline_Designator", len:3},
            {key:"Frequent_Flyer_Number", len:16},
            {key:"ID_AD_Indicator", len:1},
            {key:"Free_Baggage_Allow_ance", len:3},
            {key:"Fast_Track", len:1}
            ]
        }
    ]},
    {key:"Beginning_of_Security_Data", len:1},			
    {key:"Type_of_Security_Data", len:1	},		
    {key:"Length_of_Security_Data",fialdlen1:2, len:2 },		
    {key:"Security_Data", len:100 }
    ]

    i=0;
    j= 999;
    l= 999;
    m= 999;
    element_parse = (key_value)=>{
        
        if(!!key_value.array){
            const response =[];
            j= j || 999;
            l= l || 999;
            m= m || 999;
            for(k=0;k<key_value.array.length;k++){
                response.push(element_parse(key_value.array[k]));
            }
            return (response)
        }else{
            len = key_value.len;
            if(j == 0 || l ==0 || m == 0 || i > codetext.length){
                return({key:key_value.key,value:""})
            }
            response = {...key_value,key:key_value.key,value:codetext.substring(i, i+len),d:[j,l,m]};
            j = j - len;
            l = l - len;
            m = m - len;
            if(!!key_value.fialdlen1){
                j = parseInt(codetext.substring(i, i+len),16)
            }
            if(!!key_value.fialdlen2){
                l = parseInt(codetext.substring(i, i+len),16)
            }
            if(!!key_value.fialdlen3){
                m = parseInt(codetext.substring(i, i+len),16)
            }
            if(j > 0 || l > 0 || m > 0){
                i = i + len;
            }else{
            }
            
           
            return(response);
        }
    }

    // element_parse(bcbp_structure)
    output = [];
    for(a=0;a<bcbp_structure.length;a++){
        j= j || 999;
        l= l || 999;
        m= m || 999;
        val = element_parse(bcbp_structure[a]);
        output.push(val);
    }
    console.log(output)
    document.getElementById("result").innerText = output.map(e=>{
        if(Array.isArray(e)){
            return e.map(ee=>{
                if(Array.isArray(ee)){
                    return (ee.map(eee=>{
                        return `${eee.key}: ${eee.value}`
                    })).join("\n")
                }
                return(`${ee.key}: ${ee.value}`)
            }).join("\n")
        }
        if(!!e.callback){
            e.value = e.callback(e.value)
        }
        return (`${e.key}: ${e.value}`)


    }).join("\n")
    
})()