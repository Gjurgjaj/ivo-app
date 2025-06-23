import React, { useId, useRef } from "react";

import slugify from "slugify";

import { XIcon } from "@icon";

import * as styles from "@styles/components/UI/tags.module.scss";
import { useState } from "react";
import { useEffect } from "react";

type Props = {
  tags: { key: string; value: string }[];
  setTags: React.Dispatch<
    React.SetStateAction<{ key: string; value: string }[]>
  >;
  placeholder?: string;
  error?: string | null;
  label?: string;
  onChange?: () => void;
};

const Tags: React.FC<Props> = ({
  tags,
  setTags,
  placeholder,
  label,
  error,
  onChange = undefined,
}) => {
  const [tagsList, setTagsList] = useState<
    {
      key: string;
      value: string;
      active: boolean;
    }[]
  >([]);

  const inputEl = useRef<HTMLInputElement>(null);
  const id = useId();

  const onEdit = ({ value, key }: { key: string; value: string }) => {
    if (!inputEl.current) return;

    inputEl.current.value = value;

    setTagsList((prevState) =>
      prevState.map((item) => ({
        ...item,
        active: item.key === key,
      }))
    );
  };

  const onFocus = () => {
    if (!inputEl.current) return;

    inputEl.current.focus();
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key !== "Tab") return;

    const value = e.target.value;

    if (!value.trim()) return;

    e.preventDefault();

    setTags((prevState) => {
      const key = slugify(value, {
        lower: true,
      });

      const isEdit = tagsList.filter((item) => item.active);

      if (isEdit.length > 0) {
        return prevState.map((item) => ({
          ...item,
          value: item.key === isEdit[0].key ? value : item.value,
        }));
      }

      const isNew = prevState.filter((item) => item.key.includes(`${key}-`));

      return [
        ...prevState,
        {
          key: `${key}-${isNew.length}`,
          value,
        },
      ];
    });

    e.target.value = "";
  };

  useEffect(() => {
    setTagsList(() => {
      if (tags.length > 0) {
        return tags.map((item) => ({
          ...item,
          active: false,
        }));
      }

      if (inputEl.current) {
        inputEl.current.value = "";
      }

      return [];
    });
  }, [tags]);

  return (
    <div
      className={`${styles.tags__wrapper} ${
        error ? styles.tags__wrapper__error : ""
      }`}
    >
      {label && (
        <label htmlFor={id} className={styles.tags__label}>
          {label}
        </label>
      )}

      <div className={styles.tags} onClick={onFocus}>
        <ul className={styles.tags__list}>
          {tagsList.map((item, index) => (
            <li
              key={index}
              className={`${styles.list__item} ${
                styles[`list__item__${item.active ? "active" : ""}`]
              }`}
            >
              <p
                className={styles.item__content}
                onClick={onEdit.bind(this, item)}
              >
                {item.value}
              </p>
              <span
                className={styles.item__action}
                onClick={() => {
                  setTags((prevState) =>
                    prevState.filter((_, idx) => idx !== index)
                  );
                }}
              >
                <XIcon />
              </span>
            </li>
          ))}
        </ul>

        <input
          type="text"
          placeholder={placeholder}
          onKeyDown={onKeyDown}
          className={styles.tags__input}
          id={id}
          onChange={() => {
            if (onChange) {
              onChange();
            }
          }}
          ref={inputEl}
        />
      </div>

      {error && <p className={styles.tags__error}>{error}</p>}
    </div>
  );
};

export default Tags;
