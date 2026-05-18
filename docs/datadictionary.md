# Loading a Data Dictionary

(TBD How to use the website to load the DD)

## Expected Format for DD Table

The following table format is currently the only format accepted by the MapDragon "Load Table" function. When run, a new data dictionary table is instantiated along with relevant enumerations as new terminologies.

Fields such as _variable_name_ and _data_type_ are required. Other fields such as _description_ are optional but highly recommended.

The data should be a valid, ASCII only CSV file with double quotes used for "Quote Characters", commas for delimiters, etc.

| _Column Name_   | _Column Descriptions_                                                                                             | _Column Type_                                                |
| --------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| _variable_name_ | The human readable name associated with variable name                                                             | String                                                       |
| _description_   | Fully informative description of the contents associated with this variable/column                                | String                                                       |
| _data_type_     | Data type associated with column data                                                                             | integer, number, string, enumeration, boolean, date, datetime                         |
| _min_           | Minimum value (integers and numbers only)                                                                         | numeric value                                                |
| _max_           | Maximum acceptable value (integers and numbers only)                                                              | numeric value                                                |
| _units_         | UCUM code for units                                                                                               | UCUM code prefixed with the curie, UCUM. UCUM:ml for example |
| _enumerations_  | Semi-colon separated list of enumerated values. See below for more details about formatting the enumeration list. | String                                                       |

### Data Types Supported

| Data Type | Alternate Names | Note |
| --------- | --------------- | ---- | 
| string | | Alphanumeric text data used for names, free-text notes and identifiers | 
| boolean | bool | Binary logical values. Represents only two states, True of False | 
| enumerations | | A predefined list of allowed text values that incoming data must use to be conformant. |
| integer | int | Whole numbers without decimal points. |
| quantity | number, float, numeric | Continuous numeric values with decimal points. | 
| date | | Calender date without a time component | 
| datetime | | Combined calendar date and specific time of day. |

### Formatting for Enumerations

At the top level, enumerations are just a list of terms separated by semi-colons. For enumerated types with specified codes, these will be provided in the following format:

> 1=Male;2=Female;0=Unknown;-1=Preferred Not To Answer

In this example, the following codes are extracted: 1, 2, 0 and -1 and assigned the following displays (in order): Male, Female, Unknown and Preferred Not To Answer.

If there is no code specified, the codes will be created using the following logic:

> Case is dropped to lower case and potentially problematic characters, such as parenthesis, "(" or ")" will be removed. Whitespace characters will be replaced with underscores, "\_".

There is currently no way to allow codes or values to include semi-colons, ";", or equal signs, "=" in them. They should be replaced prior to loading into MapDragon.
