import APIService from "./api.service";
import { GET_ELEMENT } from "@/constants/endpoints";

class ElementService extends APIService {
  getElement(search: any): Promise<any> {
    const elements = [
      {
        prefix: "dei",
        name: "DocumentType",
        type: "dei:submissionTypeItemType",
        substitutionGroup: "xbrli:item",
        balance: "",
        periodType: "duration",
        label: "Document Type",
        documentation: `The type of document being provided (such as 10-K, 10-Q, 485BPOS, etc). The document type is limited to the same value as the supporting SEC submission type, or the word 'Other'.`,
      },
    ];
    return this.get(`${GET_ELEMENT(search)}`)
      .then(() => {
        return elements;
      })
      .catch(() => {
        return elements;
      });
    // return this.get(`${GET_ELEMENT(search)}`)
    //   .then((res) => {
    //     return res.data;
    //   })
    //   .catch((error: any) => {
    //     throw error.response.data?.msg || error.response.data;
    //   });
  }
}

export default ElementService;
