import axios from 'axios';

export const filterPaginationData = async ({ create_new_arr = false, state, data, page, countRoute, data_to_send = {} }) => {
    let obj = { results: [], page: 1, totalDocs: 0 };

    if (state !== null && !create_new_arr) {
        obj = { ...state, results: [...state.results, ...data], page };
    } else {
        try {
            const response = await axios.post('http://localhost:3000' + countRoute, data_to_send);
            obj = { results: data, page: 1, totalDocs: response.data.totalDocs };
        } catch (err) {
            console.error('Error fetching count data:', err);
        }
    }

    return obj;
};
