import { Grid } from "@chakra-ui/react";
import RoomSkeleton from "../components/RoomSkeletom";
import { useQuery } from "@tanstack/react-query";
import Experience from "../components/Experience";
import { getExperiences } from "../api";
import { IExperienceList } from "../types";
import { Helmet } from "react-helmet";

export default function Experiences() {
  const { isLoading, data } = useQuery<IExperienceList[]>({
    queryKey: ["experiences"],
    queryFn: getExperiences,
  });
  return (
    <Grid
      mt={"10"}
      px={{ sm: 10, lg: 20 }}
      columnGap={"4"}
      rowGap={"8"}
      templateColumns={{
        sm: "1fr",
        md: "2fr",
        lg: "repeat(3, 1fr)",
        xl: "repeat(4, 1fr)",
        "2xl": "repeat(5, 1fr)",
      }}
    >
      <Helmet>
        <title>{data ? "체험 — Airbnb clone" : "로딩 중..."}</title>
      </Helmet>
      {isLoading ? <RoomSkeleton /> : null}
      {data?.map((experience) => (
        <Experience
          key={experience.pk}
          pk={experience.pk}
          name={experience.name}
          city={experience.city}
          country={experience.country}
          price={experience.price}
          start={experience.start}
          end={experience.end}
        />
      ))}
    </Grid>
  );
}
