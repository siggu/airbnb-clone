import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Collapse,
  Flex,
  Grid,
  HStack,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Switch,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  VStack,
  useDisclosure,
  useToast,
  FormLabel,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { FaSearch, FaFilter } from "react-icons/fa";
import RoomSkeleton from "../components/RoomSkeletom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Room from "../components/Room";
import { createWishlist, getRooms, getWishlists, toggleWishlistRoom, IRoomSearchParams } from "../api";
import { IRoomList, IWishlist } from "../types";
import { Helmet } from "react-helmet";
import useUser from "../lib/useUser";
import { getErrorDetail } from "../lib/getErrorDetail";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

const KIND_OPTIONS = [
  { value: "entire_place", label: "집 전체" },
  { value: "private_room", label: "개인실" },
  { value: "shared_room", label: "공유 공간" },
];

export default function Home() {
  const { isLoggedIn } = useUser();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { isOpen: isFilterOpen, onToggle: onFilterToggle } = useDisclosure();
  const [urlParams, setUrlParams] = useSearchParams();

  // 입력 필드 로컬 상태 (제출 전)
  const [keyword, setKeyword] = useState(urlParams.get("keyword") ?? "");
  const [countryInput, setCountryInput] = useState("");
  const [cityInput, setCityInput] = useState("");

  // URL에서 필터 값 읽기
  const submittedKeyword = urlParams.get("keyword") ?? "";
  const selectedKinds = urlParams.getAll("kind");
  const selectedCountries = urlParams.getAll("country");
  const selectedCities = urlParams.getAll("city");
  const petFriendly = urlParams.get("pet_friendly") === "true" ? true : undefined;
  const minPrice = urlParams.get("min_price") ? Number(urlParams.get("min_price")) : undefined;
  const maxPrice = urlParams.get("max_price") ? Number(urlParams.get("max_price")) : undefined;
  const ordering = (urlParams.get("ordering") ?? "newest") as IRoomSearchParams["ordering"];

  const updateParam = (key: string, value: string | undefined) => {
    setUrlParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  };

  const updateArrayParam = (key: string, values: string[]) => {
    setUrlParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete(key);
      values.forEach(v => next.append(key, v));
      return next;
    });
  };

  const searchParams: IRoomSearchParams = {
    keyword: submittedKeyword || undefined,
    kind: selectedKinds.length > 0 ? selectedKinds : undefined,
    country: selectedCountries.length > 0 ? selectedCountries : undefined,
    city: selectedCities.length > 0 ? selectedCities : undefined,
    pet_friendly: petFriendly,
    min_price: minPrice,
    max_price: maxPrice,
    ordering,
  };

  const addTag = (value: string, key: string, current: string[]) => {
    const trimmed = value.trim();
    if (trimmed && !current.includes(trimmed)) updateArrayParam(key, [...current, trimmed]);
  };
  const removeTag = (value: string, key: string, current: string[]) => {
    updateArrayParam(key, current.filter(v => v !== value));
  };

  const resetFilters = () => {
    setKeyword("");
    setUrlParams({});
  };

  const { isLoading, data, isError } = useQuery<IRoomList[]>({
    queryKey: ["rooms", searchParams],
    queryFn: () => getRooms(searchParams),
  });

  const { data: wishlists } = useQuery<IWishlist[]>({
    queryKey: ["wishlists"],
    queryFn: getWishlists,
    enabled: isLoggedIn,
  });

  const wishlistedPks = new Set(
    wishlists?.flatMap((w) => w.rooms.map((r) => r.pk)) ?? []
  );

  const toggleMutation = useMutation({
    mutationFn: async (roomPk: number) => {
      if (!wishlists || wishlists.length === 0) {
        const newWishlist = await createWishlist("내 위시리스트");
        return toggleWishlistRoom(newWishlist.pk, roomPk);
      }
      return toggleWishlistRoom(wishlists[0].pk, roomPk);
    },
    onSuccess: (_, roomPk) => {
      const wasWishlisted = wishlistedPks.has(roomPk);
      toast({
        title: wasWishlisted ? "위시리스트에서 제거되었습니다." : "위시리스트에 저장되었습니다.",
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

  if (isError) {
    return (
      <VStack justifyContent={"center"} minH={"50vh"}>
        <Helmet>
          <title>오류 — StayAI</title>
        </Helmet>
        <Heading>오류가 발생했습니다.</Heading>
        <Text>숙소를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.</Text>
      </VStack>
    );
  }
  return (
    <Box mt={8} px={{ base: 4, sm: 10, lg: 20 }}>
      <Helmet>
        <title>{data ? "StayAI" : "로딩 중..."}</title>
      </Helmet>

      {/* 검색 바 */}
      <Flex gap={2} mb={3}>
        <InputGroup flex={1}>
          <InputLeftElement pointerEvents="none">
            <FaSearch color="gray" />
          </InputLeftElement>
          <Input
            placeholder="숙소명, 도시, 국가 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") updateParam("keyword", keyword || undefined); }}
          />
        </InputGroup>
        <Button colorScheme="blue" onClick={() => updateParam("keyword", keyword || undefined)}>검색</Button>
        <Button variant="outline" leftIcon={<FaFilter />} onClick={onFilterToggle}>
          필터
        </Button>
      </Flex>

      {/* 필터 패널 */}
      <Collapse in={isFilterOpen} animateOpacity>
        <Box
          border="1px" borderColor="gray.200" _dark={{ borderColor: "gray.600" }}
          rounded="xl" p={5} mb={4}
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="bold">필터</Text>
            <Button size="xs" variant="ghost" onClick={resetFilters}>초기화</Button>
          </Flex>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }} gap={5}>
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

            {/* 숙소 유형 */}
            <Box>
              <FormLabel fontSize="sm" fontWeight="semibold">숙소 유형 (다중 선택)</FormLabel>
              <CheckboxGroup value={selectedKinds} onChange={(v) => updateArrayParam("kind", v as string[])}>
                <VStack align="start" spacing={1}>
                  {KIND_OPTIONS.map((o) => (
                    <Checkbox key={o.value} value={o.value} size="sm">{o.label}</Checkbox>
                  ))}
                </VStack>
              </CheckboxGroup>
            </Box>

            {/* 국가 */}
            <Box>
              <FormLabel fontSize="sm" fontWeight="semibold">국가 (다중 선택)</FormLabel>
              <HStack mb={2}>
                <Input
                  size="sm" placeholder="국가 입력 후 Enter"
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
                      <TagCloseButton onClick={() => removeTag(c, "country", selectedCountries)} />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>

            {/* 도시 */}
            <Box>
              <FormLabel fontSize="sm" fontWeight="semibold">도시 (다중 선택)</FormLabel>
              <HStack mb={2}>
                <Input
                  size="sm" placeholder="도시 입력 후 Enter"
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
                      <TagCloseButton onClick={() => removeTag(c, "city", selectedCities)} />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>

            {/* 가격 범위 & 반려동물 */}
            <Box>
              <FormLabel fontSize="sm" fontWeight="semibold">가격 범위 (₩)</FormLabel>
              <HStack mb={3}>
                <Input
                  size="sm" placeholder="최소" type="number"
                  value={minPrice ?? ""}
                  onChange={(e) => updateParam("min_price", e.target.value || undefined)}
                />
                <Text>~</Text>
                <Input
                  size="sm" placeholder="최대" type="number"
                  value={maxPrice ?? ""}
                  onChange={(e) => updateParam("max_price", e.target.value || undefined)}
                />
              </HStack>
              <FormLabel fontSize="sm" fontWeight="semibold">반려동물 허용</FormLabel>
              <HStack spacing={3}>
                <Switch
                  isChecked={petFriendly === true}
                  onChange={(e) => updateParam("pet_friendly", e.target.checked ? "true" : undefined)}
                  colorScheme="blue"
                />
                <Text fontSize="sm">{petFriendly === true ? "허용만 보기" : "전체"}</Text>
              </HStack>
            </Box>
          </Grid>
        </Box>
      </Collapse>

      {/* 결과 수 */}
      {!isLoading && data && (
        <Text fontSize="sm" color="gray.500" mb={4}>
          숙소 {data.length}개
        </Text>
      )}

      {/* 룸 그리드 */}
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
        {!isLoading && data?.length === 0 && (
          <Text color="gray.500" gridColumn="1 / -1" textAlign="center" py={10}>
            검색 결과가 없습니다.
          </Text>
        )}
        {data?.map((room) => (
          <Room
            key={room.pk}
            pk={room.pk}
            isOwner={room.is_owner}
            imageUrl={room.photos[0]?.file ?? ""}
            name={room.name}
            rating={room.rating}
            city={room.city}
            country={room.country}
            price={room.price}
            isWishlisted={wishlistedPks.has(room.pk)}
            onToggleWishlist={
              isLoggedIn
                ? () => toggleMutation.mutate(room.pk)
                : () => toast({ title: "로그인이 필요합니다.", status: "warning", position: "bottom-right", duration: 2000 })
            }
          />
        ))}
      </Grid>
    </Box>
  );
}
