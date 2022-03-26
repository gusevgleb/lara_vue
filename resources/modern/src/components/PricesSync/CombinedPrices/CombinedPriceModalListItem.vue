<template>
  <v-list-item :ripple="false" class="row">
    <v-list-item-content>
      {{ misServiceName }}
    </v-list-item-content>

    <v-list-item-action class="col-3 my-0 py-0">
      <v-text-field
          v-model="coefficient"
          :suffix="String(computedPrice)"
          @keydown="filterTextField($event)"
      />
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import { filterKeyboardNumbers } from "@/helpers";

export default {
  name: "CombinedPriceModalListItem",

  props: {
    selectedMisService: {
      type: Object,
      default: () => {}
    },
  },

  data: () => ({
    coefficient: 1,
    price: 0,
  }),

  created() {
    this.coefficient = 1;
    this.price = this.selectedMisService.price;

    if (this.selectedMisService.coefficient) {
      this.coefficient = this.selectedMisService.coefficient;
      this.price = this.price / this.coefficient;
    }

    this.onChangeItem();
  },

  computed: {
    misServiceName() {
      return this.selectedMisService.mis_service_name;
    },

    computedPrice() {
      return this.price * this.coefficient;
    }
  },

  watch: {
    coefficient() {
      this.onChangeItem();
    },
  },

  beforeDestroy() {
    this.coefficient = 1;
    this.price = 0;
    this.onDestroyItem();
  },

  methods: {
    onChangeItem() {
      this.$emit('on-change-item', {
        priceId: this.selectedMisService.id,
        price: this.price,
        coefficient: Number(this.coefficient),
      });
    },

    onDestroyItem() {
      this.$emit('on-destroy-item', this.selectedMisService.id);
    },

    filterTextField($event) {
      if (!filterKeyboardNumbers($event.keyCode, true)) {
        $event.preventDefault();
      }
    }
  },
}
</script>
