import { Box, Grid, Skeleton, SkeletonText } from "@chakra-ui/react";

export default function home() {
  return (
    <Grid
      mt={"10"}
      px={{
        sm: 10,
        lg: 20,
      }}
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
      <Box>
        <Skeleton rounded={"2xl"} height={250} mb={7} />
        <SkeletonText w={"50%"} noOfLines={3} />
      </Box>
    </Grid>
  );
}
