const create = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);

    if (
      decoded?.usertype_in === false &&
      decoded?.is_active === false &&
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not valid user!!",
      };
      return data;
    }

    delete data["action"];
    delete data["command"];

    let saved_data = await Models.holidayCreate(data).save();

    if (saved_data != null) {
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
    console.log("error  invoice ------------>  ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    return data;
  }
};

const get_holiday_list = async function (data, authData) {
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

    // Retrieve all holidays from the 'Holiday' collection
    const holiday_list = await Models.holidayCreate.find({}).exec();

    // If there are holidays, return the data
    if (holiday_list.length > 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        message: "Holidays found.",
        data: holiday_list,
      };
    } else {
      data.response = {
        status: 200,
        result: STATUS.ERROR,
        message: "No holidays found.",
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
  get_holiday_list,
};
