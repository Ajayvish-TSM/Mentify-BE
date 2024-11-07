const attendanceService = require("../../services/attendanceService");

class attendance {
  constructor() {
    console.log(" ----->  attendance system");
  }
  async process(data, authData) {
    if (
      data["command"][0]["function"] != "" &&
      typeof this[data["command"][0]["function"]] === "function"
    ) {
      var function_name = data["command"][0]["function"];
      let result = await this[function_name](data, authData);
      return result;
    } else {
      let response = await attendanceService.create(data, authData);
      return response;
    }
  }
}
module.exports = attendance;
