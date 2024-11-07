const creaditLeaveService = require("../../services/creditLeaveService");

class leave_credit {
  constructor() {
    console.log(" -----> leave credit create");
  }
  async process(data, authData) {
    let response = await creaditLeaveService.create(data, authData);
    return response;
  }
}
module.exports = leave_credit;
