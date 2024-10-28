import React from "react";

function Table({ rows, data }) {
  return (
    <table>
      <thead>
        <tr>
          {rows.map((rows) => (
            <th key={rows}>{rows}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map(({ manual_num, types, title, content }) => (
          <tr key={manual_num + types + title + content}>
            <td>{manual_num}</td>
            <td>{types}</td>
            <td>{title}</td>
            <td>{content}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;