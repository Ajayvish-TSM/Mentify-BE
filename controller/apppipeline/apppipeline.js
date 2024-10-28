const express = require("express");

const app = express();
const apppipeline = require("express").Router();
const { userLogger } = require("../../loggerFile");
//const __filename = module.filename.split('/').slice(-1);
const configModule = require("../../module/configModule");
const prjConfig = require("../../config.json");
const { jwtToken } = require("../../system/jwt/jwt");
const appSystem = require("../../system/core/appSystem");
const appSystemObj = new appSystem();
const path = require("path");
global.Config = require("config");
global.Models = require("../../module/model");
const {
  DEFAULT_USER_IMAGE,
  ROLES,
  USER_STATUS,
  ACTIVATED_BY,
  STATUS,
} = require("../../constants");
global.DEFAULT_USER_IMAGE = DEFAULT_USER_IMAGE;
global.ROLES = ROLES;
global.USER_STATUS = USER_STATUS;
global.STATUS = STATUS;
global.ACTIVATED_BY = ACTIVATED_BY;
const Fs = require("fs");

const commonFunctions = require("../../module/services/commonFunctions");

apppipeline.post("/", async (req, res) => {
  try {
    if (req.body.action == undefined) {
      record = await commonFunctions.payment_details_store(req);
      data = record.response;

      res.status(200).json({
        statusCode: 1,
        status: "success",
        message: "success",
        data: data,
      });
    }

    const postData = req.body;
    // const headers = req.headers.host;
    // // console.log(headers, "header ---- >>>")
    // //const hostOrigin = req.protocol + '://' + req.get('host');
    // const hostOrigin = headers;
    // postData['hostOrigin'] = hostOrigin
    // const authData = await appSystemObj.getShopInfo(req.headers);
    const authData = req?.headers.authorization;
    let data = postData;
    console.log("lololo", data);
    // data["auth"] = authData;
    switch (postData.action) {
      case "command":
        userLogger.error(
          __filename,
          `Calling command function(callingCommand(data) data = ${JSON.stringify(
            data,
            null,
            4
          )}`
        );
        userLogger.error(
          __filename,
          `Calling command data = ${JSON.stringify(authData)}`
        );
        data = await callingCommand(data, authData);
        break;
      case "formcommand":
        userLogger.error(
          __filename,
          `Calling command function(callingCommand(data) data = ${JSON.stringify(
            data,
            null,
            4
          )}`
        );
        userLogger.error(
          __filename,
          `Calling command data = ${JSON.stringify(authData)}`
        );
        data = await commonFunctions.file_upload(req);
        data = data.response;
        console.log(data);
        break;
      default:
        userLogger.error(
          __filename,
          `Action not found  ${JSON.stringify(postData)}`
        );
        res.status(200).json({
          statusCode: 0,
          status: "warnning",
          message: "please check action command",
          data: data,
        });
        break;
    }

    res.status(200).json({
      statusCode: 1,
      status: "success",
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(200).json({
      statusCode: 0,
      status: "erroe",
      message: "faile by generate exception",
      data: error.stack,
    });
  }
});

const callingCommand = async (data, authData) => {
  userLogger.error(
    __filename,
    `In function(callingCommand(data) action = ${data.action}`
  );
  userLogger.error(
    __filename,
    `In function(callingCommand(data) command = ${data.command}`
  );
  const commands = data.command;
  let fullData = [];
  for (let key in commands) {
    console.log("Default ", "../../" + configModule[commands[key]["agent"]]);
    const agent = require("../../" + configModule[commands[key]["agent"]]);
    const agentObj = new agent();
    console.log(data);
    data = await agentObj.process(data, authData);
    //console.log(JSON.stringify(data)+'data inside pipeline');
    if (data.response.code != 1) {
      userLogger.error(
        __filename,
        `Error on Agent ${commands[key]["agent"]}  ${data.action}`
      );
      //throw new Error(`${data.response.message}`);
      return data.response;
    }
    // const agentName = commands[key]["agent"];
    // const agentModulePath = configModule[agentName];

    // // Debug logging
    // console.log("Agent Name:", agentName);
    // console.log("Agent Module Path from Config:", agentModulePath);

    // // Construct proper path
    // const fullPath = path.join(__dirname, "..", "..", agentModulePath);
    // console.log("Full Path:", fullPath);

    // // Load agent
    // let agent;
    // try {
    //   agent = require(fullPath);
    //   console.log("Loaded Agent Type:", typeof agent);
    // } catch (requireError) {
    //   throw new Error(
    //     `Failed to require agent at ${fullPath}: ${requireError.message}`
    //   );
    // }

    // // Create instance
    // const agentObj = new agent();

    // // Process data
    // console.log("Processing with agent:", agentName);
    // currentData = await agentObj.process(currentData, authData);

    // if (currentData.response.code !== 1) {
    //   userLogger.error(
    //     __filename,
    //     `Error on Agent ${agentName}: ${currentData.response.message}`
    //   );
    //   return currentData.response;
    // }
  }
  if (data.response.code === 1) {
    userLogger.error(
      __filename,
      `afterIn function(callingCommand(data) data = ${JSON.stringify(data)}`
    );
    return data;
  } else {
    return data;
  }
};
// const callingCommand = async (data, authData) => {
//   try {
//     userLogger.error(
//       __filename,
//       `In function(callingCommand) action = ${data.action}, command = ${data.command}`
//     );

//     const commands = data.command;
//     let currentData = { ...data };

//     for (let key in commands) {
//       const agentName = commands[key]["agent"];

//       // Debug logging before require
//       console.log("=== Starting agent processing ===");
//       console.log("Agent Name:", agentName);
//       console.log("Config Module Path:", configModule[agentName]);

//       // First verify the agent exists in config
//       if (!configModule[agentName]) {
//         throw new Error(`Agent ${agentName} not found in configuration`);
//       }

//       // Load the agent with verbose logging
//       let agent;
//       try {
//         // Log the exact path we're requiring
//         const agentPath = "../../" + configModule[agentName];
//         console.log("Attempting to require:", agentPath);

//         // Try to load the agent
//         agent = require(agentPath);
//         console.log("Agent loaded successfully");
//         console.log("Agent type:", typeof agent);
//         console.log("Agent structure:", Object.keys(agent));

//         // Handle ES6 default export
//         if (agent.default) {
//           console.log("Found ES6 default export, using it");
//           agent = agent.default;
//         }

//         // Verify we got a constructor
//         if (typeof agent !== "function") {
//           throw new Error(
//             `Agent ${agentName} is not a constructor. Got type: ${typeof agent}`
//           );
//         }
//       } catch (requireError) {
//         console.error("Error loading agent:", requireError);
//         throw new Error(
//           `Failed to load agent ${agentName}: ${requireError.message}`
//         );
//       }

//       // Create agent instance with error handling
//       let agentObj;
//       try {
//         console.log("Attempting to create agent instance");
//         agentObj = new agent();
//         console.log("Agent instance created successfully");

//         // Verify process method exists
//         if (typeof agentObj.process !== "function") {
//           throw new Error(`Agent ${agentName} does not have a process method`);
//         }
//       } catch (instantiationError) {
//         console.error("Error creating agent instance:", instantiationError);
//         throw new Error(
//           `Failed to create agent ${agentName} instance: ${instantiationError.message}`
//         );
//       }

//       // Process data with error handling
//       try {
//         console.log("Calling agent process method with data:", currentData);
//         currentData = await agentObj.process(currentData, authData);
//         console.log(
//           "Process method completed. Response:",
//           currentData.response
//         );

//         if (!currentData || !currentData.response) {
//           throw new Error("Process method returned invalid data structure");
//         }

//         if (currentData.response.code !== 1) {
//           userLogger.error(
//             __filename,
//             `Error on Agent ${agentName}: ${currentData.response.message}`
//           );
//           return currentData.response;
//         }
//       } catch (processError) {
//         console.error("Error in process method:", processError);
//         throw new Error(
//           `Error processing data with agent ${agentName}: ${processError.message}`
//         );
//       }

//       console.log("=== Completed agent processing ===");
//     }

//     return currentData;
//   } catch (error) {
//     console.error("Fatal error in callingCommand:", error);
//     userLogger.error(__filename, `Fatal error: ${error.message}`);
//     return {
//       code: -1,
//       message: error.message,
//       details: error.stack,
//     };
//   }
// };

module.exports = apppipeline;
