import React from "react";

import { InboxIcon } from "@icon";

import * as styles from "@styles/components/UI/table.module.scss";

type Props = {
  thead: {
    title: string;
    key: string;
    element?: JSX.Element;
  }[];
  tbody: {
    [x: string]: string | number | boolean | JSX.Element;
  }[];
  className?: string;
  title?: string;
  actions?: JSX.Element;
};

const Table: React.FC<Props> = ({
  thead,
  tbody,
  className = "",
  title,
  actions,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.table__header}>
        <h2 className={styles.table__title}>{title ?? "Table"}</h2>

        {actions}
      </div>

      <div className={styles.table__wrapper}>
        <table
          className={`${styles.table} ${className}`}
          cellSpacing="0"
          cellPadding="0"
        >
          {thead && thead.length > 0 && (
            <>
              <thead>
                <tr>
                  {thead.map(({ title, element }, index) => (
                    <th key={index}>{element ?? title}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {tbody.map((item, trIndex) => (
                  <tr key={trIndex}>
                    {thead.map(({ key }, tdIndex) => (
                      <td key={tdIndex}>{item[key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </>
          )}
        </table>

        {tbody.length === 0 && (
          <div className={styles.table__empty}>
            <InboxIcon />
            <p>Nuk ka asnje te dhene</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;
