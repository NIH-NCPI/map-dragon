export const TerminologyOnEdit = () => {
  const tableDataEdit = terminology => {
    return terminology?.codes?.map((code, index) => {
      return {
        key: index,
        code: code.code,
        display: code.display,
        mapped_terms: matchCode(code),
        get_mappings:
          /* If the mapping array length is greather than 0, we check if there is a matching mapped code
      to the terminology code.
                    If there is a match for the terminology code in the mapping codes AND if the mappings array for
            that code is > 0, the Edit Mappings button is displayed. On click, a modal with mapping details is opened
          and the terminology code is passed.*/

          mapping?.length > 0 ? (
            mapping.some(
              m => m.code === code.code && m?.mappings?.length > 0
            ) ? (
              <button
                key={code.code}
                className="manage_term_button"
                onClick={() => setEditMappings(code)}
              >
                Edit Mappings
              </button>
            ) : (
              /* If there is NOT a match for the terminology code in the mapping codes, the Get Mappings button
                   is displayed. On click, a modal opens that automatically performs a search in OLS for the terminology
                   code and the terminology code is passed.*/
              <button
                className="manage_term_button"
                onClick={() => setGetMappings(code)}
              >
                Get Mappings
              </button>
            )
          ) : (
            /* If the mapping array length is not greater than 0, the Get Mappings button
                   is displayed. On click, a modal opens that automatically performs a search in OLS for the terminology
                   code and the terminology code is passed.*/
            <button
              className="manage_term_button"
              onClick={() => setGetMappings(code)}
            >
              Get Mappings
            </button>
          ),
        delete_column: '',
      };
    });
  };
  return tableDataEdit();
};
