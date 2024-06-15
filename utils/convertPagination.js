function convertPagination({ data = [], currentPage = 1 }) {
  const perPageNum = 5;
  const totalArticleNum = data.length || 0;
  const totalPage = Math.ceil(totalArticleNum / perPageNum);

  if (currentPage > totalPage) currentPage = totalPage;

  const minIndex = (currentPage - 1) * perPageNum;
  const maxIndex = currentPage * perPageNum - 1;

  const sortedData = data.slice(minIndex, maxIndex + 1);
  const pagination = {
    totalPage,
    currentPage: Number(currentPage),
    hasPre: currentPage > 1,
    hasNext: currentPage < totalPage,
  };

  return {
    sortedData,
    pagination,
  };
}

module.exports = convertPagination;
