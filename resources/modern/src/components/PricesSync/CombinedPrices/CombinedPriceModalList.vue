<template>
  <v-row>
    <v-col class="col-12">
      <v-list>
        <v-list-item-group>

          <combined-price-modal-list-item
              v-for="selectedMisService in selectedMisServices"
              :key="selectedMisService.id"
              :selected-mis-service="selectedMisService"
              @on-change-item="onChangeItem"
              @on-destroy-item="onDestroyItem"
          />

        </v-list-item-group>
      </v-list>
    </v-col>
  </v-row>
</template>

<script>
import CombinedPriceModalListItem from "@/components/PricesSync/CombinedPrices/CombinedPriceModalListItem";

export default {
  name: "CombinedPriceModalList",
  components: {CombinedPriceModalListItem},

  props: {
    selectedMisServices: {
      type: Array,
      default: () => [],
    }
  },

  data: () => ({
    computedPrices: {},
  }),

  created() {
    this.computedPrices = {};
  },

  beforeDestroy() {
    this.computedPrices = {};
    this.onChangeComputedPrices();
  },

  methods: {
    onChangeItem(computedPrice) {
      this.computedPrices[computedPrice.priceId] = {
        price: computedPrice.price,
        coefficient: computedPrice.coefficient,
      };

      this.onChangeComputedPrices();
    },

    onDestroyItem(priceId) {
      delete this.computedPrices[priceId];
      this.onChangeComputedPrices();
    },

    onChangeComputedPrices() {
      this.$emit('on-change-computed-prices', this.computedPrices);
    }
  },
}
</script>
