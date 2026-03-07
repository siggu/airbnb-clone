import {
  Box,
  Button,
  Collapse,
  Flex,
  Grid,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  useDisclosure,
  useToast,
  FormLabel,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { FaSearch, FaFilter } from "react-icons/fa";
import RoomSkeleton from "../components/RoomSkeletom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Experience from "../components/Experience";
import {
  createWishlist,
  getExperiencesWithParams,
  getWishlists,
  toggleWishlistExperience,
  IExperienceSearchParams,
  IPaginatedResponse,
} from "../api";
import { IExperienceList, IWishlist } from "../types";
import { Helmet } from "react-helmet";
import useUser from "../lib/useUser";
import { getErrorDetail } from "../lib/getErrorDetail";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Pagination from "../components/Pagination";

export default function Experiences() {
  const { isLoggedIn } = useUser();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { isOpen: isFilterOpen, onToggle: onFilterToggle } = useDisclosure();
  const [urlParams, setUrlParams] = useSearchParams();

  const [keyword, setKeyword] = useState(urlParams.get("keyword") ?? "");
  const [countryInput, setCountryInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const submittedKeyword = urlParams.get("keyword") ?? "";
  const selectedCountries = urlParams.getAll("country");
  const selectedCities = urlParams.getAll("city");
  const minPrice = urlParams.get("min_price")
    ? Number(urlParams.get("min_price"))
    : undefined;
  const maxPrice = urlParams.get("max_price")
    ? Number(urlParams.get("max_price"))
    : undefined;
  const ordering = (urlParams.get("ordering") ??
    "newest") as IExperienceSearchParams["ordering"];
  const page = Number(urlParams.get("page") ?? "1");

  const updateParam = (key: string, value: string | undefined) => {
    setUrlParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("page");
      return next;
    });
  };

  const updateArrayParam = (key: string, values: string[]) => {
    setUrlParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete(key);
      values.forEach((v) => next.append(key, v));
      next.delete("page");
      return next;
    });
  };

  const searchParams: IExperienceSearchParams = {
    keyword: submittedKeyword || undefined,
    country: selectedCountries.length > 0 ? selectedCountries : undefined,
    city: selectedCities.length > 0 ? selectedCities : undefined,
    min_price: minPrice,
    max_price: maxPrice,
    ordering,
  };

  const addTag = (value: string, key: string, current: string[]) => {
    const trimmed = value.trim();
    if (trimmed && !current.includes(trimmed)) {
      updateArrayParam(key, [...current, trimmed]);
    }
  };
  const removeTag = (value: string, key: string, current: string[]) => {
    updateArrayParam(
      key,
      current.filter((v) => v !== value),
    );
  };

  const resetFilters = () => {
    setKeyword("");
    setUrlParams({});
  };

  const { isLoading, data } = useQuery<IPaginatedResponse<IExperienceList>>({
    queryKey: ["experiences", searchParams, page],
    queryFn: () => getExperiencesWithParams(searchParams, page),
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
        title: was
          ? "위시리스트에서 제거되었습니다."
          : "위시리스트에 저장되었습니다.",
        status: "success",
        position: "bottom-right",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
    onError: (error: any) => {
      toast({
        title: "오류가 발생했습니다.",
        description: getErrorDetail(error),
        status: "error",
        position: "bottom-right",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  return (
    <Box mt={8} px={{ base: 4, sm: 10, lg: 20 }}>
      <Helmet>
        <title>{data ? "체험 — StayAI" : "로딩 중..."}</title>
      </Helmet>

      {/* 검색 바 */}
      <Flex gap={2} mb={3}>
        <InputGroup flex={1}>
          <InputLeftElement pointerEvents="none">
            <FaSearch color="gray" />
          </InputLeftElement>
          <Input
            placeholder="체험명, 도시, 국가 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateParam("keyword", keyword || undefined);
            }}
          />
        </InputGroup>
        <Button colorScheme="blue" onClick={() => updateParam("keyword", keyword || undefined)}>
          검색
        </Button>
        <Button variant="outline" leftIcon={<FaFilter />} onClick={onFilterToggle}>
          필터
        </Button>
      </Flex>

      {/* 필터 패널 */}
      <Collapse in={isFilterOpen} animateOpacity>
        <Box
          border="1px"
          borderColor="gray.200"
          _dark={{ borderColor: "gray.600" }}
          rounded="xl"
          p={5}
          mb={4}
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="bold">필터</Text>
            <Button size="xs" variant="ghost" onClick={resetFilters}>
              초기화
            </Button>
          </Flex>
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
            gap={5}
          >
            {/* 정렬 */}
            <Box>
              <FormLabel fontSize="sm" fontWeight="semibold">정렬</FormLabel>
              <Select
                size="sm"
                value={ordering}
                onChange={(e) => updateParam("ordering", e.target.value)}
              >
                <option value="newest">최신순</option>
                <option value="price_asc">가격 낮은순</option>
                <option value="price_desc">가격 높은순</option>
                <option value="rating">평점순</option>
              </Select>
            </Box>

            {/* 국가 */}
            <Box>
              <FormLabel fontSize="sm" fontWeight="semibold">
                국가 (다중 선택)
              </FormLabel>
              <HStack mb={2}>
                <Input
                  size="sm"
                  placeholder="국가 입력 후 Enter"
                  value={countryInput}
                  onChange={(e) => setCountryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addTag(countryInput, "country", selectedCountries);
                      setCountryInput("");
                    }
                  }}
                />
              </HStack>
              <Wrap spacing={1}>
                {selectedCountries.map((c) => (
                  <WrapItem key={c}>
                    <Tag size="sm" colorScheme="blue">
                      <TagLabel>{c}</TagLabel>
                      <TagCloseButton
                        onClick={() => removeTag(c, "country", selectedCountries)}
                      />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>

            {/* 도시 */}
            <Box>
              <FormLabel fontSize="sm" fontWeight="semibold">
                도시 (다중 선택)
              </FormLabel>
              <HStack mb={2}>
                <Input
                  size="sm"
                  placeholder="도시 입력 후 Enter"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addTag(cityInput, "city", selectedCities);
                      setCityInput("");
                    }
                  }}
                />
              </HStack>
              <Wrap spacing={1}>
                {selectedCities.map((c) => (
                  <WrapItem key={c}>
                    <Tag size="sm" colorScheme="blue">
                      <TagLabel>{c}</TagLabel>
                      <TagCloseButton
                        onClick={() => removeTag(c, "city", selectedCities)}
                      />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>

            {/* 가격 범위 */}
            <Box>
              <FormLabel fontSize="sm" fontWeight="semibold">
                가격 범위 (₩)
              </FormLabel>
              <HStack>
                <Input
                  size="sm"
                  placeholder="최소"
                  type="number"
                  value={minPrice ?? ""}
                  onChange={(e) => updateParam("min_price", e.target.value || undefined)}
                />
                <Text>~</Text>
                <Input
                  size="sm"
                  placeholder="최대"
                  type="number"
                  value={maxPrice ?? ""}
                  onChange={(e) => updateParam("max_price", e.target.value || undefined)}
                />
              </HStack>
            </Box>
          </Grid>
        </Box>
      </Collapse>

      {/* 결과 수 */}
      {!isLoading && data && (
        <Text fontSize="sm" color="gray.500" mb={4}>
          체험 {data.count}개
        </Text>
      )}

      {/* 체험 그리드 */}
      <Grid
        columnGap={"4"}
        rowGap={"8"}
        templateColumns={{
          base: "1fr",
          sm: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
          xl: "repeat(4, 1fr)",
          "2xl": "repeat(5, 1fr)",
        }}
      >
        {isLoading ? <RoomSkeleton /> : null}
        {!isLoading && data?.results?.length === 0 && (
          <Text
            color="gray.500"
            gridColumn="1 / -1"
            textAlign="center"
            py={10}
          >
            검색 결과가 없습니다.
          </Text>
        )}
        {data?.results?.map((experience) => (
          <Experience
            key={experience.pk}
            pk={experience.pk}
            name={experience.name}
            city={experience.city}
            country={experience.country}
            price={experience.price}
            start={experience.start}
            end={experience.end}
            rating={experience.rating}
            imageUrl={experience.photos[0]?.file}
            isOwner={experience.is_owner}
            isWishlisted={wishlistedPks.has(experience.pk)}
            onToggleWishlist={() => {
              if (!isLoggedIn) {
                toast({
                  title: "로그인이 필요합니다.",
                  status: "warning",
                  position: "bottom-right",
                  duration: 2000,
                });
                return;
              }
              toggleMutation.mutate(experience.pk);
            }}
          />
        ))}
      </Grid>
      <Pagination
        currentPage={page}
        totalCount={data?.count ?? 0}
        pageSize={20}
        onPageChange={(p) =>
          setUrlParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("page", String(p));
            return next;
          })
        }
      />
    </Box>
  );
}
