<template>
  <div>
    <v-card>
      <v-card-title>
        Итоги работы умного скрипта:
      </v-card-title>
      <v-card-text>
        <v-tooltip bottom>
          <template v-slot:activator="{on, attrs}">
            <span v-on="on" v-bind="attrs">
          Всего цен в клинике: {{ smartMatchResults.data.total_count }}
            </span>
          </template>
          <span>
            Общее количество цен из клиники. Не включает созданные вручную, дубли, комбинированные, приемы
          </span>
        </v-tooltip>
        <br>

        <v-tooltip bottom>
          <template v-slot:activator="{on, attrs}">
            <span v-on="on" v-bind="attrs">
          Улетело на сайт: {{ smartMatchResults.data.total_match_count }}
            </span>
          </template>
          <span>
              Включая дубли, комбинированные, ручные
          </span>
        </v-tooltip>
        <br>

        <v-tooltip bottom>
          <template v-slot:activator="{on, attrs}">
            <span v-on="on" v-bind="attrs">
          Сопоставлено скриптом: {{ smartMatchResults.data.smart_match_count }}
            </span>
          </template>
          <span>
              Скрипт сопоставил
          </span>
        </v-tooltip>
        <br>

        <v-tooltip bottom>
          <template v-slot:activator="{on, attrs}">
            <span v-on="on" v-bind="attrs">
         Досопоставлено вручную: {{ smartMatchResults.data.manual_match_count }}
            </span>
          </template>
          <span>
              Скрипт не нашел, а КМ нашел. Не включает дубли, комбинированные, ручные
          </span>
        </v-tooltip>
        <br>

        <v-tooltip bottom>
          <template v-slot:activator="{on, attrs}">
            <span v-on="on" v-bind="attrs">
          Исправлено за скриптом: {{ smartMatchResults.data.manual_fixed_count }}
            </span>
          </template>
          <span>
            Скрипт сопоставил, но КМ вручную изменил сопоставленную услугу. Не включает дубли, комбинированные, ручные
          </span>
        </v-tooltip>
        <br>

        <v-tooltip bottom>
          <template v-slot:activator="{on, attrs}">
            <span v-on="on" v-bind="attrs">
              Сопоставлено скриптом / всего цен: {{ smartMatchResults.data.percent_by_all_price }}%
            </span>
          </template>
          <span>
            ("Сопоставлено скриптом" - "Исправлено") / ("Всего цен из клиники")
          </span>
        </v-tooltip>
        <br>

        <v-tooltip bottom>
          <template v-slot:activator="{on, attrs}">
            <span v-on="on" v-bind="attrs">
              Процент правильно сопоставленного: {{ smartMatchResults.data.success_percent }}%
            </span>
          </template>
          <span>
            ("Сопоставлено скриптом" - "Исправлено") / (Допоставлено руками" + ("Сопоставлено скриптом" - "Исправлено")
          </span>
          </v-tooltip>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>

export default {
  name: "SmartMatchResults",

  props: {
    smartMatchResults: {
      type: Object,
    },
  },
}
</script>
