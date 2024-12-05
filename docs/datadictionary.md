# Loading a Data Dictionary
(TBD How to use the website to load the DD)

## Expected Format for DD Table
The following table format is currently the only format accepted by the Map Dragon "Load Table" function. When run, a new data dictionary table is instantiated along with relevant enumerations as new terminologies.

Fields such as *variable_name* and *data_type* are required. Other fields such as *description* are optional but highly recommended. 

The data should be a valid, ASCII only CSV file with double quotes used for "Quote Characters", commas for delimiters, etc. 

| *Column Name* | *Column Descriptions* | *Column Type* |
|  ------------ | --------------------- | ------------- |
| *variable_name* | The human readable name associated with variable name | String |
| *description* | Fully informative description of the contents associated with this variable/column| String |
| *data_type* | Data type associated with column data  | integer, number, string, enumeration |
| *min* | Minimum value (integers and numbers only) | numeric value |
| *max* | Maximum acceptable value (integers and numbers only) | numeric value | 
| *units* | UCUM code for units | UCUM code prefixed with the curie, UCUM. UCUM:ml for example |
| *enumerations* | Semi-colon separated list of enumerated values. See below for more details about formatting the enumeration list. | String |

### Formatting for Enumerations
At the top level, enumerations are just a list of terms separated by semi-colons. For enumerated types with specified codes, these will be provided in the following format: 

> 1=Male;2=Female;0=Unknown;-1=Preferred Not To Answer

In this example, the following codes are extracted: 1, 2, 0 and -1 and assigned the following displays (in order): Male, Female, Unknown and Preferred Not To Answer.

If there is no code specified, the codes will be created using the following logic: 
> Case is dropped to lower case and potentially problematic characters, such as parenthesis, "(" or ")" will be removed. Whitespace characters will be replaced with underscores, "_". 

There is currently no way to allow codes or values to include semi-colons, ";", or equal signs, "=" in them. They should be replaced prior to loading into Map Dragon. 