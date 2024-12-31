const supabase = require('../app');

const getLocation = async (id) => {
  return new Promise(async (resolve, reject) => {
    const { data, error } = await supabase.from("users_location").select().eq("user_id", id);
    if (error) {
      reject(error);
    }
    resolve(data);
  })
};
