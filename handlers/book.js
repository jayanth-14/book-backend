import {supabase} from "../app";
import { inputsErrorHandler, internalErrorHandler } from "./common";


const booksHandler = async (req, res) => {
  const offset = req.query.offset || 0;
  const limit = req.query.limit || 10;
  try {
    const { data, error } = await supabase.from("Users").select().range(offset + 1, limit);
    if (error) {
      inputsErrorHandler(res, error.message);
    }
    res.status(200).json({status : "success", offset, limit, data });
  } catch (error) {
    internalErrorHandler(res, error);
  }
}

module.exports = {booksHandler}