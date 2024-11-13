interface GetTableInfoParams {
    table_name_as: string;
    tableData: string[][];
  }

export async function getTableInfo({
  table_name_as = '',
  tableData,
}: GetTableInfoParams): Promise<Array<{ [key: string]: any }>> {

  if (!tableData || tableData.length < 1) {
    throw new Error("Not enough data to check.");
  }

  const headers = tableData[0] as string[];
  const dataObjects: Array<{ [key: string]: any }> = [];

  for (let i = 1; i < tableData.length; i++) {
    let row = tableData[i];
    let dataObject: { [key: string]: any } = {};

    for (let j = 0; j < headers.length; j++) {
      dataObject[headers[j]] = row[j];
    }

    dataObjects.push(dataObject);
  }

  return dataObjects;
}