const userService = require("../../services/user");

class createAdminUser {
  constructor() {
    console.log(" ----->  createAdminUser");
  }
  async process(data, authData) {
    if (
      data["command"][0]["function"] != "" &&
      typeof this[data["command"][0]["function"]] === "function"
    ) {
      console.log("create admin se hu", data["command"][0]["function"]);
      console.log("function name janna h", this[function_name]);
      var function_name = data["command"][0]["function"];
      let result = await this[function_name](data, authData);
      return result;
    } else {
      let response = await userService.createAdminUser(data, authData);
      return response;
    }
  }

  async changeAdminPassword(data, authData) {
    let response = await userService.changeAdminPassword(data, authData);
    return response;
  }

  async getUserDetails(data, authData) {
    let response = await userService.getUserDetails(data, authData);
    return response;
  }

  async exportToCsv(data, authData) {
    let response = await userService.exportToCsv(data, authData);
    return response;
  }
}
module.exports = createAdminUser;
