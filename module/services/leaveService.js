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

    let saved_data = await Models.leaveCreate(data).save();

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

// const get_list = async (data, authData) => {
//   try {

//     const decoded = Auth.decodeToken(authData);

//     if (decoded ?. usertype_in === false && decoded ?. is_active === false && decoded ?. deleted_date !== null) {
//         data.response = {
//             status: 0,
//             message: "You are not valid user!!"
//         }
//         return data;
//     }

//     delete data["action"]
//     delete data["command"]

//     var record = await Models.menu.aggregate([
//         {
//           '$match': data
//         },
//         {
//           '$lookup': {
//             'from': 'sub_menus',
//             'localField': 'menu_id',
//             'foreignField': 'menu_id',
//             'as': 'submenu'
//           }
//         }
//     ]);

//     var submenu;
//     var submenuChild;

//     for (var i = 0; i < record.length; i++) {
//           record[i].is_add = false;
//           record[i].is_view = false;
//           record[i].is_delete = false;
//           record[i].is_edit = false;
//       if (record[i].submenu.length !== 0) {
//          submenu = record[i].submenu
//         console.log(submenu, "sub menu data")
//          for (var j = 0; j < submenu.length; j++) {
//           submenu[j].is_add = false;
//           submenu[j].is_view = false;
//           submenu[j].is_delete = false;
//           submenu[j].is_edit = false;
//             submenuChild = await Models.child_menu.find({menu_id: submenu[j].menu_id, sub_menu_id: submenu[j].sub_menu_id}).exec()

//             submenu[j].submenuChild = submenuChild
//           }

//       }
//     }

//     if (record.length > 0) {
//       data.response = {
//         status: 200,
//         result: STATUS.SUCCESS,
//         data: record,
//         message: "Data found.",
//       }
//     }else{
//       data.response = {
//           status: 0,
//           result: STATUS.ERROR,
//           message: "Data not found."
//       }
//     }
//     return data;
//   } catch (error) {
//     console.log("error  invoice ------------>  ", error)
//       data.response = {
//           status: 0,
//           result: STATUS.ERROR,
//           message: "Something is wrong",
//           error: error
//       }
//       return data;
//   }
// }
const leave_create_list = async function (data, authData) {
  try {
    // Logging the request data
    userLogger.info(
      __filename,
      "leave_create_list process request ---->  ," + data
    );

    // Decoding the authentication token
    const decoded = Auth.decodeToken(authData);
    if (
      decoded.usertype_in == false ||
      decoded.is_active == false ||
      decoded.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Invalid user!",
      };
      return data;
    }

    // Simplified filter to retrieve all leave data
    let filterData = {}; // You can add custom filters if necessary

    // Query to retrieve all leave data
    var leave_list = await Models.leaveCreate
      .find(filterData) // No filters applied, fetch all records
      .exec();

    // If leave data is found, return it in the response
    if (leave_list.length > 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: leave_list,
        message: "Data found.",
      };
    } else {
      data.response = {
        status: 200,
        result: STATUS.ERROR,
        message: "No leave data found.",
      };
    }

    userLogger.info(
      __filename,
      "leave_create process response ---->  ," + data
    );
    return data;
  } catch (error) {
    // Handle any errors
    userLogger.info(__filename, "leave_create catch block ---->  ," + error);
    console.log("error      ---------->  ", error);
    var resp = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    data.response = {
      resp,
    };
    return data;
  }
};

module.exports = {
  create,
  leave_create_list,
};
