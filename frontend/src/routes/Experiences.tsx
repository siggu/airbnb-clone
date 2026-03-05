import { Grid } from "@chakra-ui/react";
import RoomSkeleton from "../components/RoomSkeletom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Experience from "../components/Experience";
import { createWishlist, getExperiences, getWishlists, toggleWishlistExperience } from "../api";
import { IExperienceList, IWishlist } from "../types";
import { Helmet } from "react-helmet";
import useUser from "../lib/useUser";
import { useToast } from "@chakra-ui/react";

export default function Experiences() {
  const { isLoggedIn } = useUser();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { isLoading, data } = useQuery<IExperienceList[]>({
    queryKey: ["experiences"],
    queryFn: getExperiences,
  });

  const { data: wishlists } = useQuery<IWishlist[]>({
    queryKey: ["wishlists"],
    queryFn: getWishlists,
    enabled: isLoggedIn,
  });

  const wishlistedPks = new Set(
    wishlists?.flatMap((w) => (w.experiences ?? []).map((e) => e.pk)) ?? []
  );

  const toggleMutation = useMutation({
    mutationFn: async (expPk: number) => {
      if (!wishlists || wishlists.length === 0) {
        const newWishlist = await createWishlist("내 위시리스트");
        return toggleWishlistExperience(newWishlist.pk, expPk);
      }
      return toggleWishlistExperience(wishlists[0].pk, expPk);
    },
    onSuccess: (_, expPk) => {
      const was = wishlistedPks.has(expPk);
      toast({
        title: was ? "위시리스트에서 제거되었습니다." : "위시리스트에 저장되었습니다.",
        status: "success",
        position: "bottom-right",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
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
          isWishlisted={wishlistedPks.has(experience.pk)}
          onToggleWishlist={() => toggleMutation.mutate(experience.pk)}
        />
      ))}
    </Grid>
  );
}
