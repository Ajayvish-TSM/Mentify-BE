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

    let saved_data = await Models.leaveApplication(data).save();

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

const get_leave_application = async function (data, authData) {
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
    const applied_application = await Models.leaveApplication.find({}).exec();

    // If there are holidays, return the data
    if (applied_application.length > 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        message: "Applications  found.",
        data: applied_application,
      };
    } else {
      data.response = {
        status: 200,
        result: STATUS.ERROR,
        message: "No applications found.",
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
const update_leave_application = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);

    if (
      decoded?.usertype_in === false &&
      decoded?.is_active === false &&
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not a valid user!!",
      };
      return data;
    }

    // Ensure that the action and command fields are not part of the update
    delete data["action"];
    delete data["command"];

    // Ensure holiday ID is provided in the data
    if (!data.application_id) {
      data.response = {
        status: 0,
        message: "Application ID is required for update.",
      };
      return data;
    }

    // Update the holiday document in the collection
    const updated_data = await Models.leaveApplication.findByIdAndUpdate(
      data.application_id,
      {
        from_date: data.from_date,

        to_date: data.to_date,
        leave_code: data.leave_code,
        leave_reason: data.leave_reason,
        status: data.status,
      },
      { new: true } // This option returns the updated document
    );

    // Check if the update was successful
    if (updated_data) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: updated_data,
        message: "Data updated successfully.",
      };
    } else {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data not updated. Holiday ID may not exist.",
      };
    }

    return data;
  } catch (error) {
    console.log("Error updating holiday ------------>  ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something went wrong",
      error: error,
    };
    return data;
  }
};

const get_moderator_application = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);

    if (
      decoded?.usertype_in === false &&
      decoded?.is_active === false &&
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not a valid user!!",
      };
      return data;
    }

    // Ensure that the action and command fields are not part of the update
    delete data["action"];
    delete data["command"];

    // Ensure holiday ID is provided in the data
    if (!data.user_id) {
      data.response = {
        status: 0,
        message: "User ID is required",
      };
      return data;
    }

    // Update the holiday document in the collection
    //   const updated_data = await Models.leaveApplication.findByIdAndUpdate(
    //     data.application_id,
    //     {
    //       from_date: data.from_date,

    //       to_date: data.to_date,
    //       leave_code: data.leave_code,
    //       leave_reason: data.leave_reason,
    //       status: data.status,
    //     },
    //     { new: true } // This option returns the updated document
    //   );
    let updated_data;
    try {
      // Step 1: Find all users who report to this moderator
      const reportees = await Models.User.find({
        reporting_to: moderatorId,
      }).select("_id");

      if (reportees.length === 0) {
        return {
          message: "No reportees found for this moderator.",
          applications: [],
        };
      }

      // Extract the reportee IDs
      const reporteeIds = reportees.map((reportee) => reportee._id);

      // Step 2: Find all leave applications submitted by these reportees
      const leaveApplications = await Models.leaveApplication.find({
        user_id: { $in: reporteeIds },
      });

      // Return the applications
      updated_data = leaveApplications;
    } catch (error) {
      console.error("Error fetching leave applications for moderator:", error);
      throw error;
    }

    // Check if the update was successful
    if (updated_data) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: updated_data,
        message: "Data updated successfully.",
      };
    } else {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data not updated. Holiday ID may not exist.",
      };
    }

    return data;
  } catch (error) {
    console.log("Error updating holiday ------------>  ", error);
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
  get_leave_application,
  update_leave_application,
  get_moderator_application,
};
