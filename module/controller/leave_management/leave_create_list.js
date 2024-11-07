const leaveService = require("../../services/leaveService");

class leave_create_list {
  constructor() {
    console.log(" -----> leave create list");
  }
  async process(data, authData) {
    let response = await leaveService.leave_create_list(data, authData);
    return response;
  }
}
module.exports = leave_create_list;
