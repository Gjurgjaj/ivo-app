import React, { useContext, useEffect, useMemo, useRef, useState } from "react";

import Layout from "@components/Layout";
import { Course, StudentGrade, UserItem } from "@interface/context";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@utils/firebase";
import Context from "@components/Context";
import { DocumentArrowDownIcon, ExelIcon, LoadingIcon } from "@icon";
import { Button, Checkbox, Input, Modal, Select, Table, User } from "@ui";

import Seo from "@components/Seo";
import { generatePdfFile, getYear } from "@utils/helper";

import * as styles from "@styles/pages/grades.module.scss";
import { gradesInAlbanian } from "@data/grades";

import siteLogo from "../../images/logo.png";
import { RowInput } from "jspdf-autotable";
import { utils, writeFile } from "xlsx";

export const seasonList = [
  {
    key: "summer",
    value: "Verës",
  },
  {
    key: "fall",
    value: "Vjeshtës",
  },
  {
    key: "winter",
    value: "Dimrit",
  },
];

type StudentTdProps = {
  grades?: StudentGrade;
  currentSubject: string | null;
  currentCourse: string | null;
  setStudentsList: React.Dispatch<React.SetStateAction<UserItem[]>>;
  uid: string;
  loading: boolean;
};

const StudentTd: React.FC<StudentTdProps> = ({
  currentCourse,
  currentSubject,
  setStudentsList,
  grades,
  uid,
  loading,
}) => {
  const [value, setValue] = useState<string>("");

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = async (e) => {
    if (e.key !== "Enter") return;

    e.preventDefault();

    const textValue = e.currentTarget.value;

    if (textValue === "1") return;

    setStudentsList((prevState) =>
      prevState.map((item) =>
        item.uid === uid
          ? {
              ...item,
              loading: true,
            }
          : item
      )
    );

    try {
      if (grades) {
        const isNew = grades.subjects.filter(
          (item) => item.key === currentSubject
        );

        const data: StudentGrade = {
          ...grades,
          subjects:
            isNew.length > 0
              ? grades.subjects.map((item) => ({
                  ...item,
                  grade:
                    item.key === (currentSubject as string)
                      ? textValue
                      : item.grade,
                }))
              : [
                  ...grades.subjects,
                  {
                    grade: textValue,
                    key: currentSubject as string,
                  },
                ],
        };

        await updateDoc(doc(db, "grades", grades.id as string), {
          ...data,
        });

        setStudentsList((prevState) =>
          prevState.map((item) =>
            item.uid === uid
              ? {
                  ...item,
                  grades: data,
                  loading: false,
                }
              : item
          )
        );
      } else {
        const data: StudentGrade = {
          course: currentCourse as string,
          student: uid,
          subjects: [
            {
              key: currentSubject as string,
              grade: textValue,
            },
          ],
        };

        const newGrade = await addDoc(collection(db, "grades"), data);

        setStudentsList((prevState) =>
          prevState.map((item) =>
            item.uid === uid
              ? {
                  ...item,
                  grades: {
                    ...data,
                    id: newGrade.id,
                  },
                  loading: false,
                }
              : item
          )
        );
      }
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    if (grades) {
      const studentGrade = grades.subjects.filter(
        (item) => item.key === currentSubject
      );

      setValue(studentGrade.length > 0 ? studentGrade[0].grade : "");
    }
  }, [currentSubject]);

  return (
    <Input
      placeholder="Nota"
      type="text"
      className={styles.user__grade}
      value={value}
      disabled={loading}
      onChange={(e) => {
        const allowedCharacters = new Set([
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10",
          "m",
        ]);

        const textValue = e.target.value.trim();

        if (textValue.length === 0) setValue("");

        if (textValue === "1") setValue("1");

        if (allowedCharacters.has(textValue)) setValue(textValue);
      }}
      onKeyDown={onKeyDown}
      onBlur={(e) => {
        if (e.currentTarget.value === "1") setValue("");
      }}
    />
  );
};

const TeacherPage = ({ isTeacher }: { isTeacher?: boolean }) => {
  const { currentUser } = useContext(Context);

  const [loading, setLoading] = useState<boolean>(false);
  const [studentsList, setStudentsList] = useState<UserItem[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [loadingCourseList, setLoadingCourseList] = useState<boolean>(false);
  const [currentCourse, setCurrentCourse] = useState<string | null>(null);
  const [currentSubject, setCurrentSubject] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  const seasonEl = useRef<HTMLSelectElement>(null);
  const examDateEl = useRef<HTMLInputElement>(null);
  const [validExamDate, setValidExamDate] = useState<string | null>(null);

  const [allTeachers, setAllTeachers] = useState<string>("");

  const fetchCourses = async () => {
    if (!currentUser) return;

    const coursesData =
      (isTeacher
        ? currentUser.courses
        : currentUser.payments?.map((e) => e.id)) ?? [];

    setLoadingCourseList(true);

    try {
      const docs = await getDocs(query(collection(db, "courses")));

      if (docs.docs.length > 0) {
        const courses = (
          docs.docs.map((item) => ({
            ...item.data(),
            id: item.id,
            loading: false,
          })) as Course[]
        ).sort((a, b) => a.course.localeCompare(b.course));

        const coursesMap: {
          [x: string]: boolean;
        } = {};

        coursesData.forEach((item) => {
          coursesMap[item as string] = true;
        });

        const teacherCoursesData = courses.filter(
          (item) => coursesMap[item.id as string]
        );

        setCoursesList(isTeacher ? teacherCoursesData : courses);
        setCurrentCourse(
          isTeacher
            ? (teacherCoursesData[0].id as string)
            : (courses[0].id as string)
        );
        setCurrentSubject(
          courses[0].subjects.sort((a, b) => a.value.localeCompare(b.value))[0]
            .key
        );

        await fetchStudents(courses[0].id as string);
      }
    } catch (error) {
      // console.log(error);
    }

    setLoadingCourseList(false);
  };

  const fetchStudents = async (subjectId: string) => {
    setLoading(true);

    setStudentsList([]);

    try {
      const q = query(collection(db, "users"), where("role", "==", "student"));
      const docs = await getDocs(q);

      if (docs.docs.length > 0) {
        const students = docs.docs.map((item) => item.data()) as UserItem[];

        const gradesQuery = query(
          collection(db, "grades"),
          where("course", "==", subjectId)
        );
        const gradeDocs = await getDocs(gradesQuery);

        if (gradeDocs.docs.length > 0) {
          const studentsMap: { [x: string]: StudentGrade } = {};

          gradeDocs.docs.forEach((item) => {
            const data = item.data() as StudentGrade;

            studentsMap[data.student] = {
              ...data,
              id: item.id,
            };
          });

          const newStudentList: UserItem[] = students.map((item) =>
            studentsMap[item.uid]
              ? {
                  ...item,
                  grades: studentsMap[item.uid],
                }
              : item
          );

          setStudentsList(newStudentList);
        } else {
          setStudentsList(students);
        }
      }
    } catch (error) {
      // console.log(error);
    }

    setLoading(false);
  };

  const getSubjects = () => {
    const subjectData = coursesList.filter(
      (item) => (item.id as string) === currentCourse
    );

    if (subjectData.length > 0 && subjectData[0].subjects) {
      return subjectData[0].subjects.map((item) => ({
        key: item.key,
        value: item.value.replace(/[0-9]/g, ""),
      }));
    }

    return [];
  };

  const onChangeCourse: React.ChangeEventHandler<HTMLSelectElement> = async (
    el
  ) => {
    setCurrentCourse(el.target.value);

    const subjectData = coursesList.find(
      (item) => (item.id as string) === el.target.value
    );

    if (subjectData?.subjects[0].key)
      setCurrentSubject(subjectData?.subjects[0].key);

    setCurrentYear(null);

    await fetchStudents(el.target.value);
  };

  const filterStudentsByYear = (students: UserItem[]): UserItem[] => {
    const years: { [s: string]: boolean } = {};

    studentsList.forEach((item) => {
      if (item.payments) {
        item.payments.forEach((i) => {
          if (i.startDate && i.id === currentCourse) {
            years[getYear(i.startDate)] = true;
          }
        });
      }
    });

    const selectedYear =
      currentYear && years[currentYear]
        ? currentYear
        : Object.keys(years).length > 0
        ? Number(Object.keys(years)[0])
        : null;

    return studentsList
      .filter(
        (item) =>
          item.payments &&
          item.payments.filter((i) => {
            if (
              i.id === currentCourse &&
              i.startDate &&
              getYear(i.startDate) === selectedYear
            ) {
              return i;
            }
          }).length > 0
      )
      .sort((a, b) => a?.name.localeCompare(b?.name));
  };

  const onExportGrades: React.FormEventHandler<HTMLFormElement> = async (
    form
  ) => {
    form.preventDefault();

    if (!(seasonEl.current && examDateEl.current)) return;

    const students: RowInput[] = filterStudentsByYear(studentsList)
      .filter((e) => e.checked)
      .map((item, index) => {
        const grade =
          item.grades &&
          item.grades.subjects.length > 0 &&
          item.grades.subjects.filter((i) => i.key === currentSubject).length >
            0
            ? (() => {
                const userGrade = item.grades.subjects.filter(
                  (i) => i.key === currentSubject
                )[0].grade;

                if (userGrade === "m") return `nuk u paraqit`;
                if (userGrade === "") return `-`;

                return `${userGrade} (${gradesInAlbanian[Number(userGrade)]})`;
              })()
            : "-";

        return [
          {
            content: index + 1,
            styles: {
              halign: "center",
            },
          },
          item.name,
          item.fatherName ?? "-",
          item.lastName ?? "-",
          grade,
        ] as RowInput;
      });

    // Use pdf

    const selectedCourse = coursesList.find((e) => e.id === currentCourse);

    const selectedYear = (() => {
      const years: { [s: string]: boolean } = {};

      studentsList.forEach((item) => {
        if (item.payments) {
          item.payments.forEach((i) => {
            if (i.startDate && i.id === currentCourse) {
              years[getYear(i.startDate)] = true;
            }
          });
        }
      });

      if (Object.keys(years).length > 0) {
        return Object.keys(years).map((item) => ({
          key: item,
          value: `${item}-${Number(item) + 1}`,
        }));
      }

      return [];
    })();

    const subject = selectedCourse?.subjects.find(
      (e) => e.key === currentSubject
    );

    const currentSelectedSubject = (
      subject?.value ??
      selectedCourse?.subjects[0].value ??
      ""
    ).replace(/[0-9]/g, "");

    generatePdfFile({
      image: siteLogo,
      season: seasonEl.current.value,
      students,
      date: examDateEl.current.value,
      course: selectedCourse?.course ?? "",
      subject: currentSelectedSubject,
      teachers: allTeachers,
      timeline:
        selectedYear.find((e) => e.key === currentYear?.toString())?.value ??
        selectedYear[0].value.toString(),
      year: selectedCourse?.year,
    });
  };

  const onExelExports = async () => {
    const worksheet = utils.json_to_sheet(
      filterStudentsByYear(studentsList).map((item) => ({
        matriculation: item.matriculation,
        name: item.name,
        fatherName: item.fatherName,
        lastName: item.lastName,
        birthDay: item.birthDay,
        gender: item.gender ? "Mashkull" : "Femër",
        isMarried: item.isMarried
          ? `${item.gender ? "I" : "E"} Martuar`
          : `Beqar${item.gender ? "" : "e"}`,
        birthplace: item.birthplace,
        location: item.location,
        phone: item.phone,
        highSchool: item.highSchool,
        highSchoolID: item.highSchoolID,
        cardID: item.cardID,
        alName: item.alName,
        transferAlName: item.transferAlName,
        prevMatriculation: item.prevMatriculation,
        registerDate: item.registerDate,
        ...(() => {
          const subjects: { [key: string]: string } = {};

          item.grades?.subjects
            .sort((a, b) => a.key.localeCompare(b.key))
            .forEach((e) => {
              subjects[e.key] = e.grade;
            });

          return subjects;
        })(),
      }))
    );

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Dates");

    /* fix headers */
    utils.sheet_add_aoa(
      worksheet,
      [
        [
          "Nr. matrikullimi",
          "Emri",
          "Atësia",
          "Mbiemri",
          "Datëlindja",
          "Gjinia",
          "Gjendja civile",
          "Vendlindja",
          "Adresa e vendbanimit në RSH",
          "Telefon",
          "Shkolla e mesme",
          "ID mature/nr. regjistri të veçantë",
          "NID",
          "Emri i IAL-së ku ka kryer studimet e Ciklit të Parë",
          "IAL-ja nga është transferuar",
          "Numri i matrikullimit të mëparshëm",
          "Data e regjistrimit",
          ...getSubjects()
            .sort((a, b) => a.key.localeCompare(b.key))
            .map((item) => item.value),
        ],
      ],
      { origin: "A1" }
    );

    const courseNam = coursesList.find((e) => e.id === currentCourse);

    /* create an XLSX file and try to save to Presidents.xlsx */
    writeFile(workbook, `${courseNam?.course ?? "Notat"}.xlsx`, {
      compression: true,
    });
  };

  useEffect(() => {
    if (currentUser) fetchCourses();
  }, [currentUser]);

  return (
    <Layout>
      <Seo title="Notat e Studentëve" />

      <h1 className={styles.students__title}>Studentet</h1>

      {loadingCourseList ? (
        <div className={styles.loading}>
          <LoadingIcon />
        </div>
      ) : (
        <>
          <div className={styles.students__filter}>
            <Select
              label="Dega"
              options={coursesList.map((item) => ({
                key: item.id as string,
                value: item.course,
              }))}
              className={styles.select__course}
              onChange={onChangeCourse}
            />

            {currentCourse && (
              <Select
                label="Lënda"
                options={getSubjects()}
                onChange={(e) => {
                  setCurrentSubject(e.target.value);
                }}
              />
            )}

            <Button
              icon={<ExelIcon />}
              text="Shkarko në Excel"
              className={styles.exel}
              style="light"
              onClick={onExelExports}
            />
          </div>

          {loading ? (
            <div className={styles.loading}>
              <LoadingIcon />
            </div>
          ) : (
            <Table
              title="Lista e studentëve"
              className={styles.table}
              thead={[
                {
                  title: "Selekto",
                  key: "checkbox",
                  element: (
                    <Checkbox
                      checked={!studentsList.find((e) => !e.checked)}
                      onClick={() => {
                        const isChecked = !studentsList.find((e) => !e.checked);

                        setStudentsList((prevState) =>
                          prevState.map((item) => ({
                            ...item,
                            checked: !isChecked,
                          }))
                        );
                      }}
                    />
                  ),
                },
                {
                  title: "Nr.",
                  key: "index",
                },
                {
                  title: "Studenti",
                  key: "user",
                },
                {
                  title: "Nota",
                  key: "grade",
                },
              ]}
              actions={
                <div className={styles.table__actions}>
                  <Select
                    options={(() => {
                      const years: { [s: string]: boolean } = {};

                      studentsList.forEach((item) => {
                        if (item.payments) {
                          item.payments.forEach((i) => {
                            if (i.startDate && i.id === currentCourse) {
                              years[getYear(i.startDate)] = true;
                            }
                          });
                        }
                      });

                      if (Object.keys(years).length > 0) {
                        return Object.keys(years).map((item) => ({
                          key: item,
                          value: `${item}-${Number(item) + 1}`,
                        }));
                      }

                      return [];
                    })()}
                    onChange={(e) => setCurrentYear(Number(e.target.value))}
                    className={styles.action__year}
                  />

                  <Button
                    text="Exporto"
                    disabled={!studentsList.find((e) => e.checked)}
                    icon={<DocumentArrowDownIcon />}
                    onClick={() => setIsExporting((prevState) => !prevState)}
                  />
                </div>
              }
              tbody={filterStudentsByYear(studentsList).map(
                (
                  { name, email, grades, uid, loading, checked, lastName },
                  index
                ) => ({
                  checkbox: (
                    <Checkbox
                      checked={!!checked}
                      onClick={() => {
                        setStudentsList((prevState) =>
                          prevState.map((item) => ({
                            ...item,
                            checked:
                              uid === item.uid ? !item.checked : item.checked,
                          }))
                        );
                      }}
                    />
                  ),
                  index: <span>{index + 1}</span>,
                  user: (
                    <User name={`${name} ${lastName ?? ""}`} email={email} />
                  ),
                  grade: (
                    <StudentTd
                      currentCourse={currentCourse}
                      currentSubject={currentSubject}
                      grades={grades}
                      uid={uid}
                      key={uid}
                      setStudentsList={setStudentsList}
                      loading={loading as boolean}
                    />
                  ),
                })
              )}
            />
          )}

          {!loading && (
            <Modal visible={isExporting} setVisible={setIsExporting}>
              <div className={styles.modal__content}>
                <h3 className={styles.modal__header}>Exporto Notat</h3>

                <form onSubmit={onExportGrades} className={styles.modal__form}>
                  <Select
                    label="Sezoni"
                    options={seasonList}
                    className={styles.form__select}
                    elRef={seasonEl}
                  />

                  <Input
                    type="text"
                    label="Pedagoget"
                    placeholder="Emri..."
                    value={allTeachers}
                    onChange={(e) => setAllTeachers(e.currentTarget.value)}
                  />

                  <Input
                    type="date"
                    label="Data e provimit"
                    elRef={examDateEl}
                    error={validExamDate}
                    defaultValue={(() => {
                      var curr = new Date();
                      curr.setDate(curr.getDate());
                      return curr.toISOString().substring(0, 10);
                    })()}
                    onChange={() =>
                      validExamDate ? setValidExamDate(null) : null
                    }
                  />

                  <Button
                    text="Shkarko"
                    type="submit"
                    className={styles.form__submit}
                    icon={<DocumentArrowDownIcon />}
                  />
                </form>
              </div>
            </Modal>
          )}
        </>
      )}
    </Layout>
  );
};

export default TeacherPage;
