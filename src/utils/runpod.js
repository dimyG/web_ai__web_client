import {AxiosInstance2 as axios} from "./axios";
// import store from "src/store";
// import {messagesSlice} from "src/features/Messages/messagesSlice";
import urls from "src/urls";

const ai_tools_urls = urls.ai_tools;

class RunpodClient {
  constructor(delay = 2000) {
    this.runpod_api_key = process.env.REACT_APP_RUNPOD_API_KEY;
    this.runpod_status_url =  ai_tools_urls.runpod_status;  // todo: store it in an ENV variable
    this.delay = delay;
  }

  async runpod_get_status(run_id, num_errors = 0) {
    // returns [run_status, base64_image_string]

    const status_url = this.runpod_status_url;
    const runpod_key = this.runpod_api_key;
    const delay = this.delay;

    const num_retries_on_error = 2;
    const retry_limit_reached_status = 'RETRY LIMIT REACHED';

    while (true) {
      const response = await axios.get(status_url + run_id, {
        // we use axios1 on external services because there is no need for the refresh token logic of axios2
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${runpod_key}`
        }
      });

      const http_status = response.status;

      if (http_status === 500 && num_errors < num_retries_on_error) {
        num_errors++;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      else if (http_status === 500 && num_errors >= num_retries_on_error) {
        console.warn(`Number of retries limit reached (${num_errors}).`);
        return [retry_limit_reached_status, null];
      }

      else if (http_status === 200) {
        const json = response.data;

        const run_status = json.status;
        let base64_image_string = null;
        console.debug(`run_status: ${run_status}`)

        if (run_status === 'COMPLETED') {
          // if status "COMPLETED" then the response contains an output field
          base64_image_string = json.output;
        }

        return [run_status, base64_image_string];
      }

      else {
        console.error(`Unexpected http status: ${http_status}, response: ${JSON.stringify(response.data)}`);
        throw new Error(`http status: ${http_status}, response: ${JSON.stringify(response.data)}`);
      }
    }
  }

}

export {RunpodClient}
