@extends('layouts.app', [
    'class' => '',
    'elementActive' => 'drinks'
])

@section('content')
<div class="content">
    <div class="row">
        <div class="col-md-12">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="mb-0">Type de boisson</h5>
                <div>
                    <a href="{{ route('group.create') }}">
                        <button class="btn btn-default btn-fab btn-icon btn-round">
                            <i class="nc-icon nc-simple-add"></i>
                        </button>
                    </a>
                </div>
            </div>
            @if (count($data['groups']) === 0)
            <p>Aucun groupe de boisson ajouté. Commencer par en ajoutez-un.</p>
            @else
            <div class="d-flex">
                @foreach ($data['groups'] as $group)
                <form action="{{ route('group.destroy', $group->id) }}" method="POST" enctype="multipart/form-data">
                    @csrf
                    @method('DELETE')
                    <div class="card mr-2">
                        <div class="card-body">
                            {{$group->name}}
                        </div>
                        <div class="card-footer">
                            <div class="d-flex justify-content-between">
                                <a href="{{ route('group.show', $group->id) }}">
                                    <button type="button" class="btn btn-default">
                                        <span>Modifier</span>
                                    </button>
                                </a>
                                <button type="submit" class="ml-1 btn btn-danger">
                                    <span>Supprimer</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
                @endforeach
            </div>
            @endif
        </div>
    </div>
    <hr />
    <div class="row">
        @foreach ($data['groupsAndDrinks'] as $group)
        <div class="col-md-12">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="mb-0">{{$group->name}}</h5>
                <div>
                    <a href="{{ route('drink.create') }}">
                        <button class="btn btn-default btn-fab btn-icon btn-round">
                            <i class="nc-icon nc-simple-add"></i>
                        </button>
                    </a>
                </div>
            </div>
            @if ($group->drinks->count() === 0)
            <p>Aucune boisson ajoutées. Ce type de boisson ne sera pas présent dans votre carte.</p>
            @else
            <div class="d-flex">
                @foreach ($group->drinks as $drink)
                <form action="{{ route('drink.destroy', $drink->id) }}" method="POST" enctype="multipart/form-data">
                    @csrf
                    @method('DELETE')
                    <div class="card mr-2">
                        <div class="card-body">
                            {{$drink->name}}
                        </div>
                        <div class="card-footer">
                            <div class="d-flex justify-content-between">
                                <a href="{{ route('drink.show', $drink->id) }}">
                                    <button type="button" class="btn btn-default">
                                        <span>Modifier</span>
                                    </button>
                                </a>
                                <button type="submit" class="btn btn-danger ml-1">
                                    <span>Supprimer</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
                @endforeach
            </div>
            @endif
        </div>
        @endforeach
    </div>
</div>
@endsection

@push('scripts')
    <script>

    </script>
@endpush
