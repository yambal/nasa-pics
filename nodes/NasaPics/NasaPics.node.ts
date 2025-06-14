import type {
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

/**
 * 宣言型ノードの場合、通常はINodeTypeとINodeTypeDescriptionがインポートされます。
 * ノードの主要なロジックを定義するクラスを作成し、INodeTypeインターフェースを実装します。
 */
export class NasaPics implements INodeType {
  // ノードのメタデータを定義します。INodeTypeDescription型を持つ
	description: INodeTypeDescription = {
		displayName: 'NASA Pics',
		name: 'nasaPics',
    icon: 'file:nasapics.svg',
		group: ['transform'],     //  ワークフローの実行時にノードがどのように振る舞うか trigger, schedule, input, output
		version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Get data from NASAs API',
		defaults: {
			name: 'Example Node',
		},
		inputs: [NodeConnectionType.Main],  // 入力コネクタの名前を定義します。単一のコネクタの場合は['main']と指定します
		outputs: [NodeConnectionType.Main],  // 出力コネクタの名前を定義します。単一のコネクタの場合は['main']と指定します
    credentials: [  // ノードが使用する認証情報を定義します。
      {
        name: 'nasaPicsApi',
        required: true,
      },
    ],
    requestDefaults: {  // ノードが行うAPI呼び出しの基本的な情報を設定します。baseURLは必須で、共通のheadersやurlなどを指定できます
      baseURL: 'https://api.nasa.gov',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
		properties: [ // ノードの動作を定義する重要な部分
			{
				displayName: 'Resource',  // リソースオブジェクト: APIで操作する「リソース」（例: "Card"）を定義します。displayNameは常に'Resource'、nameは常に'resource'とするのが標準です
				name: 'resource',
				type: 'options',
        default: 'astronomyPictureOfTheDay',
        noDataExpression: true,
				options: [
          {
            name: 'Astronomy Picture of the Day',
            value: 'astronomyPictureOfTheDay',
          },
          {
            name: 'Mars Rover Photo',
            value: 'marsRoverPhotos',
          }
        ]
			},
      {
        displayName: 'Operation', // 操作オブジェクト: 特定のリソースに対して実行できる「操作」（例: "Get all"）を定義します。options配列内に各操作の動作（ルーティング、REST動詞など）を記述します。
        name: 'operation',
        type: 'options',
        default: 'get',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: [
              'astronomyPictureOfTheDay',
            ]
          }
        },
        options: [
          {
            name: 'Get',
            value: 'get',
            action: 'Get the APOD',
            description: 'Get the Astronomy Picture of the day',
            routing: {
              request: {
                method: 'GET',
                url: '/planetary/apod',
              }
            }
          }
        ]
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: [
              'marsRoverPhotos',
            ],
          },
        },
        options: [
          {
            name: 'Get',
            value: 'get',
            action: 'Get mars rover photo',
            description: 'Get photos from the Mars Rover',
            routing: {
              request: {
                method: 'GET',
              },
            },
          },
        ],
        default: 'get',
      },
      {
        displayName: 'Rover Name', // 追加フィールドオブジェクト: GUIの「Additional Fields」セクションに表示されるオプションのパラメータを定義します
        description: 'Choose which Mars Rover to get a photo from',
        required: true,
        name: 'roverName',
        type: 'options',
        options: [
            {name: 'Curiosity', value: 'curiosity'},
            {name: 'Opportunity', value: 'opportunity'},
            {name: 'Perseverance', value: 'perseverance'},
            {name: 'Spirit', value: 'spirit'},
        ],
        routing: {
            request: {
                url: '=/mars-photos/api/v1/rovers/{{$value}}/photos',
            },
        },
        default: 'curiosity',
        displayOptions: {
            show: {
                resource: [
                    'marsRoverPhotos',
                ],
            },
        },
      },
      {
        displayName: 'Date',
        description: 'Earth date',
        required: true,
        name: 'marsRoverDate',
        type: 'dateTime',
        default:'',
        displayOptions: {
            show: {
                resource: [
                    'marsRoverPhotos',
                ],
            },
        },
        routing: {
            request: {
                // You've already set up the URL. qs appends the value of the field as a query string
                qs: {
                    earth_date: '={{ new Date($value).toISOString().substr(0,10) }}',
                },
            },
        },
      },
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        default: {},
        placeholder: 'Add Field',
        displayOptions: {
            show: {
                resource: [
                    'astronomyPictureOfTheDay',
                ],
                operation: [
                    'get',
                ],
            },
        },
        options: [
            {
                displayName: 'Date',
                name: 'apodDate',
                type: 'dateTime',
                default: '',
                routing: {
                    request: {
                        // You've already set up the URL. qs appends the value of the field as a query string
                        qs: {
                            date: '={{ new Date($value).toISOString().substr(0,10) }}',
                        },
                    },
                },
            },
        ],	
      }
		],
    usableAsTool: true,
	}
}
