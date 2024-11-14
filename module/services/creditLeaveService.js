const create = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);

    // Validate the user's authentication and permissions
    if (
      !decoded?.usertype_in ||
      !decoded?.is_active ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not a valid user!",
      };
      return data;
    }

    // Ensure required fields are present, including leaveType
    if (!data.leaveType || !["credit", "debit"].includes(data.leaveType)) {
      data.response = {
        status: 0,
        message: "Invalid leave type provided.",
      };
      return data;
    }

    // Clean up the input data
    delete data["action"];
    delete data["command"];

    // Create a new leave entry in the database
    const saved_data = await new Models.creditLeave(data).save();

    // Prepare response based on save result
    if (saved_data) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: saved_data,
        message: "Data stored successfully.",
      };
    } else {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data not stored.",
      };
    }

    return data;
  } catch (error) {
    console.log("Error creating leave record: ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something went wrong",
      error: error,
    };
    return data;
  }
};

const get_credit_list = async function (data, authData) {
  try {
    // Decode the token to verify the user's authentication
    const decoded = Auth.decodeToken(authData);

    // Check if the user is valid (active and not deleted)
    if (
      decoded?.usertype_in === false ||
      decoded?.is_active === false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not a valid user!!",
      };
      return data;
    }
    const skip = data.limit * (data.page_no - 1);
    const limit = data.limit;

    // Define base filter; can add specific conditions if needed
    let filterData = {};

    const credit_list = await Models.creditLeave
      .find(filterData)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    // Get total count for pagination
    const total_records = await Models.creditLeave.countDocuments(filterData);
    // Calculate the number of pages
    const total_pages = Math.ceil(total_records / limit);

    if (credit_list.length > 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        total_records: total_records,
        total_pages: total_pages,
        message: "Credit leave found.",
        data: credit_list,
      };
    } else {
      data.response = {
        status: 200,
        result: STATUS.ERROR,
        message: "No credit leave found.",
      };
    }

    return data;
  } catch (error) {
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something went wrong",
      error: error,
    };
    return data;
  }
};
module.exports = {
  create,
  get_credit_list,
};
