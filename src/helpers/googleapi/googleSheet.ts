interface GetTableInfoParams {
    tableData: string[][];
  }

export async function getTableInfo({
  tableData,
}: GetTableInfoParams): Promise<Array<{ [key: string]: string | undefined }>> {
  if (!tableData || tableData.length < 1) {
    throw new Error("Not enough data to check.");
  }

  const headers = tableData[0] as string[];
  const dataObjects: Array<{ [key: string]: string | undefined }> = [];

  for (let i = 1; i < tableData.length; i++) {
    const row = tableData[i];
    const dataObject: { [key: string]: string | undefined } = {};

    for (let j = 0; j < headers.length; j++) {
      dataObject[headers[j]] = row[j];
    }

    dataObjects.push(dataObject);
  }

  return dataObjects;
}