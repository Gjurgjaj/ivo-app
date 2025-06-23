import React, { useEffect, useRef, useState } from "react";

import { CashIcon, XIcon } from "@icon";
import Button from "./UI/Button";
import CheckBoxGroup from "./UI/CheckBoxGroup";
import Input from "./UI/Input";

import { formatDate, getDayDifference, getYear } from "@utils/helper";

import * as styles from "@styles/components/payment_card.module.scss";
import Checkbox from "./UI/Checkbox";
import { UserItem } from "@interface/context";

export type PaymentItem = {
  id: string;
  discount?: number;
  startDate?: string;
  payments: {
    date: string;
    price: number;
  }[];
  done?: boolean;
  cost?: number;
  euro?: boolean;
  expire?: {
    enabled?: boolean;
    startDate?: string;
    endDate?: string;
    cost?: number;
  };
};

type Props = {
  title: string;
  coursePayments: PaymentItem[];
  id: string;
  onRemovePayment: (id: string, index: number) => void;
  setUserData: React.Dispatch<React.SetStateAction<Partial<UserItem>>>;
};

const PaymentCard: React.FC<Props> = ({
  title,
  coursePayments,
  id,
  onRemovePayment,
  setUserData,
}) => {
  const [payout, setPayout] = useState<{
    date: string;
    price: string;
  }>({
    date: "",
    price: "",
  });

  const allPaymentsCount =
    coursePayments.length > 0 && coursePayments[0].payments.length > 0
      ? coursePayments[0].payments
          .map((e) => e.price)
          .filter((e) => e)
          .reduce((prevValue, currentValue) => (prevValue += currentValue), 0)
      : 0;

  const userDiscount =
    coursePayments.length > 0 && coursePayments[0].discount
      ? coursePayments[0].discount
      : 0;

  const extendedPaymentFee: number =
    coursePayments[0]?.expire?.startDate &&
    coursePayments[0]?.expire?.endDate &&
    coursePayments[0]?.expire?.cost &&
    !coursePayments[0]?.done &&
    new Date().getTime() >=
      new Date(coursePayments[0]?.expire?.startDate).getTime()
      ? Number(
          (
            getDayDifference(
              coursePayments[0]?.expire?.startDate,
              new Date().getTime() >
                new Date(coursePayments[0]?.expire?.endDate).getTime()
                ? coursePayments[0]?.expire?.endDate
                : new Date().toString()
            ) * coursePayments[0]?.expire?.cost
          ).toFixed(2)
        )
      : 0;

  const notPaidAmount =
    (coursePayments[0]?.cost ?? 0) +
    extendedPaymentFee -
    (allPaymentsCount + userDiscount);

  const valuteText = coursePayments[0]?.euro ? "€" : "ALL ";

  return (
    <CheckBoxGroup
      title={title}
      status={(() => {
        if (notPaidAmount <= 0) return "success";

        if (extendedPaymentFee > 0) return "fail";

        return "light";
      })()}
      className={styles.payment__card}
      actions={
        <div className={styles.actions__wrapper}>
          <div className={styles.cost}>
            <Input
              type="number"
              label="Kostoja"
              placeholder="Vlera..."
              value={coursePayments[0]?.cost}
              onChange={(e) => {
                setUserData((prevState) => ({
                  ...prevState,
                  payments: (() => {
                    if (coursePayments.length > 0) {
                      return (prevState?.payments ?? []).map((item) => ({
                        ...item,
                        cost:
                          item.id === id ? e.target.valueAsNumber : item.cost,
                      }));
                    }

                    return [
                      ...(prevState?.payments ?? []),
                      {
                        id,
                        payments: [],
                        cost: e.target.valueAsNumber,
                      },
                    ];
                  })(),
                }));
              }}
              className={styles.cost_input}
            />

            <div className={styles.cost_currency}>
              <Checkbox
                id="cost_currency"
                checked={!!coursePayments[0]?.euro}
                onClick={() => {
                  setUserData((prevState) => ({
                    ...prevState,
                    payments: (() => {
                      if (coursePayments.length > 0) {
                        return (prevState?.payments ?? []).map((item) => ({
                          ...item,
                          euro: item.id === id ? !item.euro : item.euro,
                        }));
                      }

                      return [
                        ...(prevState?.payments ?? []),
                        {
                          id,
                          payments: [],
                          euro: true,
                        },
                      ];
                    })(),
                  }));
                }}
              />
              <label htmlFor="cost_currency">Valuta ne euro</label>
            </div>

            <div className={styles.expire_check}>
              <Checkbox
                id="expire"
                checked={!!coursePayments[0]?.expire?.enabled}
                onClick={() => {
                  setUserData((prevState) => ({
                    ...prevState,
                    payments: (() => {
                      if (coursePayments.length > 0) {
                        return (prevState?.payments ?? []).map((item) => {
                          if (item.id !== id) return item;

                          const isOn = !item.expire?.enabled;

                          return {
                            ...item,
                            expire: {
                              ...item.expire,
                              enabled: isOn,
                              endDate: !isOn
                                ? undefined
                                : item?.expire?.endDate,
                              startDate: !isOn
                                ? undefined
                                : item?.expire?.startDate,
                              cost: !isOn ? undefined : item?.expire?.cost,
                            },
                          };
                        });
                      }

                      return [
                        ...(prevState?.payments ?? []),
                        {
                          id,
                          payments: [],
                          expire: {
                            enabled: true,
                          },
                        },
                      ];
                    })(),
                  }));
                }}
              />
              <label htmlFor="expire">Kamate Vonese</label>
            </div>
          </div>

          {coursePayments[0]?.expire?.enabled && (
            <div className={styles.expire}>
              <div className={styles.expire__inputs}>
                <Input
                  type="date"
                  label="Filimi kamates"
                  value={coursePayments[0]?.expire?.startDate}
                  onChange={(e) => {
                    setUserData((prevState) => ({
                      ...prevState,
                      payments: (() => {
                        if (coursePayments.length > 0) {
                          return (prevState?.payments ?? []).map((item) => ({
                            ...item,
                            expire: {
                              ...item.expire,
                              startDate:
                                item.id === id
                                  ? e.target.value
                                  : item.expire?.startDate,
                            },
                          }));
                        }

                        return [
                          ...(prevState?.payments ?? []),
                          {
                            id,
                            payments: [],
                            expire: {
                              startDate: e.target.value,
                            },
                          },
                        ];
                      })(),
                    }));
                  }}
                  className={styles.cost_input}
                />

                <Input
                  type="date"
                  label="Mbarimi kamates"
                  value={coursePayments[0]?.expire?.endDate}
                  onChange={(e) => {
                    setUserData((prevState) => ({
                      ...prevState,
                      payments: (() => {
                        if (coursePayments.length > 0) {
                          return (prevState?.payments ?? []).map((item) => ({
                            ...item,
                            expire: {
                              ...item.expire,
                              endDate:
                                item.id === id
                                  ? e.target.value
                                  : item.expire?.endDate,
                            },
                          }));
                        }

                        return [
                          ...(prevState?.payments ?? []),
                          {
                            id,
                            payments: [],
                            expire: {
                              endDate: e.target.value,
                            },
                          },
                        ];
                      })(),
                    }));
                  }}
                  className={styles.cost_input}
                />

                <Input
                  type="number"
                  label="Kostoja ditore"
                  value={coursePayments[0]?.expire?.cost}
                  // disabled={!!isEdit}
                  onChange={(e) => {
                    setUserData((prevState) => ({
                      ...prevState,
                      payments: (() => {
                        if (coursePayments.length > 0) {
                          return (prevState?.payments ?? []).map((item) => ({
                            ...item,
                            expire: {
                              ...item.expire,
                              cost:
                                item.id === id
                                  ? e.target.valueAsNumber
                                  : item.expire?.cost,
                            },
                          }));
                        }

                        return [
                          ...(prevState?.payments ?? []),
                          {
                            id,
                            payments: [],
                            expire: {
                              cost: e.target.valueAsNumber,
                            },
                          },
                        ];
                      })(),
                    }));
                  }}
                  className={styles.cost_input}
                />
              </div>
            </div>
          )}

          <div className={styles.payment__actions}>
            <Input
              type="month"
              label="Viti Akademik"
              value={coursePayments[0]?.startDate ?? ""}
              onChange={(e) => {
                setUserData((prevState) => ({
                  ...prevState,
                  payments: (() => {
                    if (!prevState.payments || prevState?.payments.length === 0)
                      return [
                        {
                          id,
                          payments: [],
                          startDate: e.target.value,
                        },
                      ];

                    return prevState.payments.map((item) => ({
                      ...item,
                      startDate:
                        item.id === id ? e.target.value : item.startDate,
                    }));
                  })(),
                }));
              }}
            />

            <Input
              type="number"
              label="Discount"
              placeholder="Vlera..."
              value={
                coursePayments.length > 0 && coursePayments[0].discount
                  ? coursePayments[0].discount
                  : ""
              }
              onChange={(e) => {
                setUserData((prevState) => ({
                  ...prevState,
                  payments: (() => {
                    if (coursePayments.length > 0) {
                      return (prevState?.payments ?? []).map((item) => ({
                        ...item,
                        discount:
                          item.id === id
                            ? e.target.valueAsNumber
                            : item.discount,
                      }));
                    }

                    return [
                      ...(prevState?.payments ?? []),
                      {
                        startDate: "",
                        id,
                        payments: [],
                        discount: e.target.valueAsNumber,
                      },
                    ];
                  })(),
                }));
              }}
            />
          </div>
        </div>
      }
    >
      <div className={styles.content__total_payment}>
        <h3 className={styles.price}>
          {valuteText}
          {notPaidAmount > 0 ? notPaidAmount : 0}
        </h3>

        <span className={styles.description}>
          Totali për tu paguar{" "}
          {coursePayments[0]?.expire?.enabled &&
            coursePayments[0]?.expire?.startDate &&
            coursePayments[0]?.expire?.endDate &&
            coursePayments[0]?.expire?.cost &&
            !!extendedPaymentFee && (
              <span>
                Kamatë +{valuteText}
                {extendedPaymentFee}
              </span>
            )}
        </span>
      </div>

      <div className={styles.content__payments}>
        <p className={styles.payments__title}>Pagesa te realizuara:</p>

        {coursePayments.length > 0 && coursePayments[0].payments.length > 0 ? (
          <ul className={styles.students__payments}>
            {coursePayments[0].payments
              .sort(
                (a, b) =>
                  new Date(b.date).valueOf() - new Date(a.date).valueOf()
              )
              .map(({ price, date }, index) => (
                <li key={index} className={styles.payment}>
                  {`${formatDate(new Date(date))} - €${price}`}{" "}
                  <Button
                    style="danger"
                    icon={<XIcon />}
                    onClick={() => {
                      onRemovePayment(id, index);
                    }}
                  />{" "}
                </li>
              ))}
          </ul>
        ) : (
          <strong>Boshe</strong>
        )}

        <div className={styles.payments__form}>
          <Input
            type="date"
            label="Data"
            placeholder="Data"
            value={payout?.date}
            disabled={!coursePayments[0]?.cost}
            onChange={(e) => {
              setPayout((prevState) => ({
                ...prevState,
                date: e.target.value,
              }));
            }}
          />

          <Input
            type="number"
            label="Pagesa"
            placeholder="Shuma"
            value={payout?.price}
            disabled={!coursePayments[0]?.cost}
            onChange={(e) => {
              setPayout((prevState) => ({
                ...prevState,
                price: e.target.value,
              }));
            }}
          />

          <Button
            text="Shto Page"
            icon={<CashIcon />}
            disabled={!payout.price || !payout.date || !coursePayments[0]?.cost}
            onClick={() => {
              setUserData((prevState) => ({
                ...prevState,
                payments: (() => {
                  return (prevState?.payments ?? []).map((e) => {
                    if (e.id !== id) return e;

                    const extendedPaymentFee: number =
                      e?.expire?.startDate &&
                      e?.expire?.endDate &&
                      e?.expire?.cost &&
                      new Date().getTime() >=
                        new Date(e?.expire?.startDate).getTime()
                        ? Number(
                            (
                              getDayDifference(
                                e?.expire?.startDate,
                                new Date().getTime() >
                                  new Date(e?.expire?.endDate).getTime()
                                  ? e?.expire?.endDate
                                  : new Date().toString()
                              ) * e?.expire?.cost
                            ).toFixed(2)
                          )
                        : 0;

                    return {
                      ...e,
                      payments: [
                        ...e.payments,
                        { date: payout.date, price: Number(payout.price) },
                      ],
                      done:
                        (e.cost ?? 0) +
                          extendedPaymentFee -
                          (e.payments.reduce(
                            (prevValue, currentValue) =>
                              (prevValue += currentValue.price),
                            0
                          ) +
                            Number(payout.price)) <=
                        0,
                    };
                  });
                })(),
              }));

              setPayout({
                date: "",
                price: "",
              });
            }}
          />
        </div>
      </div>
    </CheckBoxGroup>
  );
};

export default PaymentCard;
